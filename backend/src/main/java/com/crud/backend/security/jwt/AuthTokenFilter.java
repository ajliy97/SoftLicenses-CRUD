package com.crud.backend.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.stream.Collectors;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public AuthTokenFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        System.out.println("\n AUTH FILTER");
        System.out.println("Request: " + method + " " + path);
        
        // Solo excluir rutas completamente públicas
        boolean isPublicRoute = 
            path.startsWith("/api/v1/auth/") ||
            (path.startsWith("/api/v1/licencia") && method.equals("GET")) ||
            (path.startsWith("/api/usuarios/email/") && method.equals("GET")); 
        
        if (isPublicRoute) {
            System.out.println("Ruta pública, sin validar token");
            System.out.println("=aaab\n");
            chain.doFilter(request, response);
            return;
        }

        System.out.println("Ruta protegida, validando token...");
        
        try {
            String token = resolveToken(request);
            System.out.println("Token presente: " + (token != null ? "SÍ" : "NO"));
            
            if (token != null) {
                System.out.println("Token (primeros 50 chars): " + token.substring(0, Math.min(50, token.length())) + "...");
                
                boolean isValid = jwtUtils.validate(token);
                System.out.println("Token válido: " + isValid);
                
                if (isValid) {
                    String email = jwtUtils.getEmail(token);
                    String rol = jwtUtils.getRol(token);
                    
                    System.out.println("Email: " + email);
                    System.out.println("Rol del token: " + rol);

                    String authority = "ROLE_" + rol.toUpperCase();
                    System.out.println("   - Convertido a authority: " + authority);
                    
                    var authorities = java.util.List.of(new SimpleGrantedAuthority(authority));
                    System.out.println("Authorities finales: " + authorities);
                    
                    var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    System.out.println("Autenticación establecida correctamente");
                } else {
                    System.out.println("Token inválido");
                }
            } else {
                System.out.println("No hay token en el header Authorization");
            }
        } catch (Exception e) {
            System.err.println("ERROR en filtro JWT: " + e.getMessage());
            e.printStackTrace();
        }
    
            System.out.println("AB\n");
            chain.doFilter(request, response);
        }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        System.out.println("Header Authorization: " + (header != null ? header.substring(0, Math.min(30, header.length())) + "..." : "NULL"));
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}