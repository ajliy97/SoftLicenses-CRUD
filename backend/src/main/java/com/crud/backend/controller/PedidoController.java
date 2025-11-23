package com.crud.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.crud.backend.model.Pedido;
import com.crud.backend.model.Usuario;
import com.crud.backend.repository.UsuarioRepository;
import com.crud.backend.service.PedidoService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:5173")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ENDPOINTS DEL CARRITO (requieren autenticación)
    
    @GetMapping("/carrito")
    public ResponseEntity<?> obtenerCarrito(@RequestHeader("Usuario-Id") String usuarioIdStr) {
        System.out.println("Obteniendo carrito para usuario ID: " + usuarioIdStr);
        
        if (usuarioIdStr == null || usuarioIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Debe estar logueado para acceder al carrito");
        }
        try {
            Long usuarioId = Long.parseLong(usuarioIdStr);
            Pedido carrito = pedidoService.obtenerCarrito(usuarioId);
            return ResponseEntity.ok(carrito);
        } catch (NumberFormatException e) {
            System.err.println("Error: ID de usuario inválido: " + usuarioIdStr);
            return ResponseEntity.badRequest().body("ID de usuario inválido");
        } catch (RuntimeException e) {
            System.err.println("Error al obtener carrito: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/carrito/licencia/{licenciaId}")
    public ResponseEntity<?> agregarLicencia(
            @RequestHeader("Usuario-Id") String usuarioIdStr,
            @PathVariable Long licenciaId) {
        System.out.println("Agregando licencia " + licenciaId + " al carrito del usuario: " + usuarioIdStr);
        
        if (usuarioIdStr == null || usuarioIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Debe estar logueado para agregar productos al carrito");
        }
        try {
            Long usuarioId = Long.parseLong(usuarioIdStr);
            Pedido carrito = pedidoService.agregarLicencia(usuarioId, licenciaId);
            System.out.println("Licencia agregada exitosamente");
            return ResponseEntity.ok(carrito);
        } catch (NumberFormatException e) {
            System.err.println("Error: ID de usuario inválido: " + usuarioIdStr);
            return ResponseEntity.badRequest().body("ID de usuario inválido");
        } catch (RuntimeException e) {
            System.err.println("Error al agregar licencia: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/carrito/licencia/{licenciaId}")
    public ResponseEntity<?> eliminarLicencia(
            @RequestHeader("Usuario-Id") String usuarioIdStr,
            @PathVariable Long licenciaId) {
        System.out.println("Eliminando licencia " + licenciaId + " del carrito del usuario: " + usuarioIdStr);
        
        if (usuarioIdStr == null || usuarioIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Debe estar logueado");
        }
        try {
            Long usuarioId = Long.parseLong(usuarioIdStr);
            Pedido carrito = pedidoService.eliminarLicencia(usuarioId, licenciaId);
            System.out.println("Licencia eliminada exitosamente");
            return ResponseEntity.ok(carrito);
        } catch (NumberFormatException e) {
            System.err.println("Error: ID de usuario inválido: " + usuarioIdStr);
            return ResponseEntity.badRequest().body("ID de usuario inválido");
        } catch (RuntimeException e) {
            System.err.println("Error al eliminar licencia: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/carrito/vaciar")
    public ResponseEntity<?> vaciarCarrito(@RequestHeader("Usuario-Id") String usuarioIdStr) {
        System.out.println("Vaciando carrito del usuario: " + usuarioIdStr);
        
        if (usuarioIdStr == null || usuarioIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Debe estar logueado");
        }
        try {
            Long usuarioId = Long.parseLong(usuarioIdStr);
            pedidoService.vaciarCarrito(usuarioId);
            System.out.println("Carrito vaciado exitosamente");
            return ResponseEntity.ok().body("Carrito vaciado exitosamente");
        } catch (NumberFormatException e) {
            System.err.println("Error: ID de usuario inválido: " + usuarioIdStr);
            return ResponseEntity.badRequest().body("ID de usuario inválido");
        } catch (RuntimeException e) {
            System.err.println("Error al vaciar carrito: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/carrito/confirmar")
    public ResponseEntity<?> confirmarCompra() {
        try {
            Long usuarioId = obtenerUsuarioIdAutenticado();
            Pedido pedidoConfirmado = pedidoService.confirmarCompra(usuarioId);
            return ResponseEntity.ok(pedidoConfirmado);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/carrito/licencia/{licenciaId}/cantidad")
    public ResponseEntity<?> actualizarCantidad(
            @PathVariable Long licenciaId,
            @RequestParam Integer cantidad) {
        try {
            Long usuarioId = obtenerUsuarioIdAutenticado();
            System.out.println("Actualizando cantidad de licencia " + licenciaId + " a " + cantidad);
            
            Pedido carrito = pedidoService.actualizarCantidadLicencia(usuarioId, licenciaId, cantidad);
            
            return ResponseEntity.ok(carrito);
        } catch (Exception e) {
            System.err.println("Error al actualizar cantidad: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/historial")
    public ResponseEntity<?> obtenerHistorial(@RequestHeader("Usuario-Id") String usuarioIdStr) {
        System.out.println("Obteniendo historial del usuario: " + usuarioIdStr);
        
        if (usuarioIdStr == null || usuarioIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Debe estar logueado");
        }
        try {
            Long usuarioId = Long.parseLong(usuarioIdStr);
            List<Pedido> historial = pedidoService.obtenerHistorialPedidos(usuarioId);
            System.out.println("Historial obtenido: " + historial.size() + " pedidos");
            return ResponseEntity.ok(historial);
        } catch (NumberFormatException e) {
            System.err.println("Error: ID de usuario inválido: " + usuarioIdStr);
            return ResponseEntity.badRequest().body("ID de usuario inválido");
        } catch (RuntimeException e) {
            System.err.println("Error al obtener historial: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{pedidoId}")
    public ResponseEntity<Pedido> getPedidoById(@PathVariable Long pedidoId) {
        System.out.println("Buscando pedido ID: " + pedidoId);
        return pedidoService.getById(pedidoId)
            .map(pedido -> {
                System.out.println("Pedido encontrado");
                return ResponseEntity.ok(pedido);
            })
            .orElseGet(() -> {
                System.err.println("Pedido no encontrado");
                return ResponseEntity.notFound().build();
            });
    }

    @PostMapping
    public ResponseEntity<?> createPedido(
            @RequestHeader("Usuario-Id") String usuarioIdStr,
            @RequestBody Pedido pedido) {
        System.out.println("Creando nuevo pedido para usuario: " + usuarioIdStr);
        
        if (usuarioIdStr == null || usuarioIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Debe estar logueado");
        }
        try {
            Long usuarioId = Long.parseLong(usuarioIdStr);
            Pedido nuevoPedido = pedidoService.save(pedido);
            System.out.println("Pedido creado con ID: " + nuevoPedido.getId());
            return ResponseEntity.ok(nuevoPedido);
        } catch (NumberFormatException e) {
            System.err.println("Error: ID de usuario inválido: " + usuarioIdStr);
            return ResponseEntity.badRequest().body("ID de usuario inválido");
        } catch (RuntimeException e) {
            System.err.println("Error al crear pedido: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{pedidoId}")
    public ResponseEntity<?> deletePedido(
            @RequestHeader("Usuario-Id") String usuarioIdStr,
            @PathVariable Long pedidoId) {
        System.out.println("Eliminando pedido ID: " + pedidoId + " (usuario: " + usuarioIdStr + ")");
        
        if (usuarioIdStr == null || usuarioIdStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Debe estar logueado");
        }
        try {
            Long usuarioId = Long.parseLong(usuarioIdStr);
            pedidoService.delete(pedidoId);
            System.out.println("Pedido eliminado exitosamente");
            return ResponseEntity.ok().body("Pedido eliminado exitosamente");
        } catch (NumberFormatException e) {
            System.err.println("Error: ID de usuario inválido: " + usuarioIdStr);
            return ResponseEntity.badRequest().body("ID de usuario inválido");
        } catch (RuntimeException e) {
            System.err.println("Error al eliminar pedido: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Agregar este método al final de la clase PedidoController, antes del último }

    private Long obtenerUsuarioIdAutenticado() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            System.out.println("Email autenticado: " + email);
            
            // Buscar el usuario por email
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            System.out.println("Usuario ID: " + usuario.getId());
            return usuario.getId();
        } catch (Exception e) {
            System.err.println("Error al obtener usuario autenticado: " + e.getMessage());
            throw new RuntimeException("No se pudo obtener el usuario autenticado");
        }
    }
}