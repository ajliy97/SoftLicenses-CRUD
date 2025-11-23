package com.crud.backend.security;

import com.crud.backend.security.jwt.AuthEntryPointJwt;
import com.crud.backend.security.jwt.AuthTokenFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

    private final AuthTokenFilter authTokenFilter;
    private final AuthEntryPointJwt authEntryPointJwt;

    public WebSecurityConfig(AuthTokenFilter authTokenFilter, AuthEntryPointJwt authEntryPointJwt) {
        this.authTokenFilter = authTokenFilter;
        this.authEntryPointJwt = authEntryPointJwt;
        System.out.println("WebSecurityConfig inicializado con AuthTokenFilter: " + authTokenFilter);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("Configurando SecurityFilterChain...");
        
        http
            .cors()
            .and()
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(e -> e.authenticationEntryPoint(authEntryPointJwt))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/usuario/email/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/usuarios/email/**").permitAll()
                
                // Licencias - GET público, resto ADMIN
                .requestMatchers(HttpMethod.GET, "/api/v1/licencia/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/licencia/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/licencia/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/licencia/**").hasRole("ADMIN")
                
                // Pedidos - Requiere autenticación
                .requestMatchers(HttpMethod.GET, "/api/v1/pedido/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/pedido/**").hasRole("USER")
                .requestMatchers(HttpMethod.PUT, "/api/v1/pedido/**").hasRole("USER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/pedido/**").hasAnyRole("USER", "ADMIN")
                
                // Gestión de usuarios - Solo ADMIN
                .requestMatchers("/api/v1/usuario/**").hasRole("ADMIN")
                
                .anyRequest().authenticated()
            );
        
        
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
        
        System.out.println("SecurityFilterChain configurado correctamente");
        return http.build();
    }
}