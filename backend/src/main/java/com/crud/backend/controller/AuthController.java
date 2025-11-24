package com.crud.backend.controller;

import com.crud.backend.model.Usuario;
import com.crud.backend.payload.LoginRequest;
import com.crud.backend.payload.RegisterRequest;
import com.crud.backend.repository.UsuarioRepository;
import com.crud.backend.security.jwt.JwtUtils;
import com.crud.backend.service.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    //private static final Set<String> VALID_ROLES = Set.of("USER","ADMIN");

    public AuthController(
        UsuarioRepository usuarioRepository,
        PasswordEncoder passwordEncoder,
        JwtUtils jwtUtils
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        System.out.println("=== REGISTRO ===");
        System.out.println("Email: " + req.getEmail());
        System.out.println("Rol recibido: " + req.getRol());
        
        if (usuarioRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email ya existe"));
        }
        
        Usuario user = new Usuario();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setNombre(req.getEmail().split("@")[0]);
        
        // Asignar roles (si no vienen, usar USER por defecto)
        if (req.getRol() == null || req.getRol().isEmpty()) {
            user.setRol("USER");
        } else {
            user.setRol(req.getRol());
        }
        
        usuarioRepository.save(user);
        System.out.println("Usuario guardado con roles: " + user.getRol());
        
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        System.out.println("Login attempt: " + req.getEmail());
        
        var user = usuarioRepository.findByEmail(req.getEmail()).orElse(null);
        
        if (user == null) {
            System.out.println("Usuario no encontrado");
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
        
        System.out.println("Usuario encontrado: " + user.getEmail());
        
        boolean passwordMatch = passwordEncoder.matches(req.getPassword(), user.getPassword());
        System.out.println("Password match: " + passwordMatch);
        
        if (!passwordMatch) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
        
        String token = jwtUtils.generateToken(user.getEmail(), user.getRol());
        return ResponseEntity.ok(Map.of(
            "token", token,
            "email", user.getEmail(),
            "rol", user.getRol()            
        ));
    }

}