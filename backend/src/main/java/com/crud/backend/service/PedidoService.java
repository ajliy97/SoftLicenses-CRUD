package com.crud.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.crud.backend.model.Licencia;
import com.crud.backend.model.Pedido;
import com.crud.backend.model.PedidoLicencia;
import com.crud.backend.model.Usuario;
import com.crud.backend.repository.LicenciaRepository;
import com.crud.backend.repository.PedidoRepository;
import com.crud.backend.repository.UsuarioRepository;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private LicenciaRepository licenciaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Obtener o crear el carrito (pedido único) del usuario
    @Transactional
    public Pedido obtenerCarrito(Long usuarioId) {
        System.out.println("Buscando carrito para usuario ID: " + usuarioId);

        Optional<Pedido> carritoExistente = pedidoRepository
            .findByUsuarioIdAndEstado(usuarioId, "carrito");

        if (carritoExistente.isPresent()) {
            System.out.println("Carrito existente encontrado con " + carritoExistente.get().getPedidoLicencias().size() + " licencias");
            return carritoExistente.get();
        }

        System.out.println("Creando nuevo carrito para usuario ID: " + usuarioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> {
                System.err.println("Usuario no encontrado con ID: " + usuarioId);
                return new RuntimeException("Usuario no encontrado");
            });

        Pedido nuevoCarrito = new Pedido();
        nuevoCarrito.setUsuario(usuario);
        nuevoCarrito.setEstado("carrito");
        nuevoCarrito.setTotal(0.0);

        Pedido carritoGuardado = pedidoRepository.save(nuevoCarrito);
        System.out.println("Nuevo carrito creado con ID: " + carritoGuardado.getId());

        return carritoGuardado;
    }

    // Agregar licencia al carrito
    @Transactional
    public Pedido agregarLicencia(Long usuarioId, Long licenciaId) {
        System.out.println("Agregando licencia ID " + licenciaId + " al carrito del usuario ID " + usuarioId);

        Pedido carrito = obtenerCarrito(usuarioId);

        Licencia licencia = licenciaRepository.findById(licenciaId)
            .orElseThrow(() -> {
                System.err.println("Licencia no encontrada con ID: " + licenciaId);
                return new RuntimeException("Licencia no encontrada");
            });

        // Verificar stock
        if (licencia.getCantidad_stock() <= 0) {
            System.err.println("Sin stock para licencia: " + licencia.getNombre());
            throw new RuntimeException("No hay stock disponible para esta licencia");
        }

        // Verificar si la licencia ya está en el carrito
        boolean yaExiste = carrito.getPedidoLicencias().stream()
            .anyMatch(pl -> pl.getLicencia().getId().equals(licenciaId));

        if (yaExiste) {
            System.out.println("La licencia ya está en el carrito");
            calcularTotal(carrito);
            Pedido carritoActualizado = pedidoRepository.save(carrito);
            return carritoActualizado;
        }

        PedidoLicencia pedidoLicencia = new PedidoLicencia();
        pedidoLicencia.setPedido(carrito);
        pedidoLicencia.setLicencia(licencia);
        pedidoLicencia.setCantidad(1);

        carrito.getPedidoLicencias().add(pedidoLicencia);
        calcularTotal(carrito);

        Pedido carritoActualizado = pedidoRepository.save(carrito);
        System.out.println("Licencia agregada. Total de licencias: " + carritoActualizado.getPedidoLicencias().size());
        System.out.println("Total del carrito: $" + carritoActualizado.getTotal());

        return carritoActualizado;
    }

    // Eliminar licencia del carrito
    @Transactional
    public Pedido eliminarLicencia(Long usuarioId, Long licenciaId) {
        System.out.println("Eliminando licencia ID " + licenciaId + " del carrito del usuario ID " + usuarioId);

        Pedido carrito = obtenerCarrito(usuarioId);

        boolean eliminada = carrito.getPedidoLicencias().removeIf(pl -> pl.getLicencia().getId().equals(licenciaId));

        if (eliminada) {
            System.out.println("Licencia eliminada del carrito");
        } else {
            System.out.println("Licencia no estaba en el carrito");
        }

        calcularTotal(carrito);

        Pedido carritoActualizado = pedidoRepository.save(carrito);
        System.out.println("Total de licencias restantes: " + carritoActualizado.getPedidoLicencias().size());
        System.out.println("Total del carrito: $" + carritoActualizado.getTotal());

        return carritoActualizado;
    }

    // Vaciar carrito
    @Transactional
    public void vaciarCarrito(Long usuarioId) {
        System.out.println("Vaciando carrito del usuario ID: " + usuarioId);

        Pedido carrito = obtenerCarrito(usuarioId);
        int cantidadLicencias = carrito.getPedidoLicencias().size();

        carrito.getPedidoLicencias().clear();
        carrito.setTotal(0.0);
        pedidoRepository.save(carrito);

        System.out.println("Carrito vaciado. Se eliminaron " + cantidadLicencias + " licencias");
    }

    // Confirmar compra y descontar stock
    @Transactional
    public Pedido confirmarCompra(Long usuarioId) {
        System.out.println("Confirmando compra del usuario ID: " + usuarioId);

        Pedido carrito = obtenerCarrito(usuarioId);

        if (carrito.getPedidoLicencias().isEmpty()) {
            System.err.println("El carrito está vacío");
            throw new RuntimeException("El carrito está vacío");
        }

        System.out.println("Verificando stock de " + carrito.getPedidoLicencias().size() + " licencias...");

        // Verificar stock de todas las licencias
        for (PedidoLicencia pl : carrito.getPedidoLicencias()) {
            Licencia licencia = pl.getLicencia();
            int cantidadSolicitada = pl.getCantidad();
            if (licencia.getCantidad_stock() < cantidadSolicitada) {
                System.err.println("Stock insuficiente para: " + licencia.getNombre());
                throw new RuntimeException("No hay stock disponible para: " + licencia.getNombre());
            }
        }

        // DESCONTAR STOCK
        System.out.println("Descontando stock:");
        for (PedidoLicencia pl : carrito.getPedidoLicencias()) {
            Licencia licencia = pl.getLicencia();
            int cantidadSolicitada = pl.getCantidad();

            int nuevoStock = licencia.getCantidad_stock() - cantidadSolicitada;
            licencia.setCantidad_stock(nuevoStock);
            licenciaRepository.save(licencia);

            System.out.println("- " + licencia.getNombre() + ": " + licencia.getCantidad_stock() + " → " + nuevoStock);
        }

        // Cambiar estado del carrito a confirmado
        carrito.setEstado("confirmado");
        Pedido pedidoConfirmado = pedidoRepository.save(carrito);

        System.out.println("Compra confirmada. Pedido ID: " + pedidoConfirmado.getId());
        System.out.println("Total de la compra: $" + pedidoConfirmado.getTotal());

        return pedidoConfirmado;
    }

    // Obtener historial de pedidos confirmados del usuario
    public List<Pedido> obtenerHistorialPedidos(Long usuarioId) {
        System.out.println("Obteniendo historial de pedidos del usuario ID: " + usuarioId);

        List<Pedido> historial = pedidoRepository.findByUsuarioId(usuarioId).stream()
            .filter(p -> !"carrito".equals(p.getEstado()))
            .collect(Collectors.toList());

        System.out.println("Se encontraron " + historial.size() + " pedidos confirmados");

        return historial;
    }

    public Optional<Pedido> getById(Long pedidoId) {
        return pedidoRepository.findById(pedidoId);
    }

    @Transactional
    public Pedido save(Pedido pedido) {
        System.out.println("Guardando pedido...");
        System.out.println("Pedido recibido: " + pedido);

        // Validar que las licencias no sean null
        if (pedido.getPedidoLicencias() == null || pedido.getPedidoLicencias().isEmpty()) {
            System.err.println("El pedido debe tener al menos una licencia");
            throw new IllegalArgumentException("El pedido debe tener al menos una licencia");
        }

        System.out.println("Licencias en el pedido: " + pedido.getPedidoLicencias().size());

        // Calcular total automáticamente
        calcularTotal(pedido);

        // Estado por defecto
        if (pedido.getEstado() == null || pedido.getEstado().isEmpty()) {
            pedido.setEstado("PENDIENTE");
        }

        Pedido guardado = pedidoRepository.save(pedido);
        System.out.println("Pedido guardado con ID: " + guardado.getId());
        System.out.println("Total: $" + guardado.getTotal());

        return guardado;
    }

    @Transactional
    public void delete(Long id) {
        System.out.println("Eliminando pedido ID: " + id);
        pedidoRepository.deleteById(id);
        System.out.println("Pedido eliminado");
    }

    // Calcular total
    private void calcularTotal(Pedido pedido) {
        double total = pedido.getPedidoLicencias().stream()
            .mapToDouble(pl -> pl.getLicencia().getPrecio() * pl.getCantidad())
            .sum();
        pedido.setTotal(total);
    }

    @Transactional
    public Pedido actualizarCantidadLicencia(Long usuarioId, Long licenciaId, Integer cantidad) {
        System.out.println("Actualizando cantidad para usuario " + usuarioId +
                        ", licencia " + licenciaId + ", cantidad " + cantidad);

        Pedido carrito = obtenerCarrito(usuarioId);

        if (cantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        // Buscar el PedidoLicencia correspondiente
        PedidoLicencia pedidoLicencia = carrito.getPedidoLicencias().stream()
            .filter(pl -> pl.getLicencia().getId().equals(licenciaId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("La licencia no está en el carrito"));

        pedidoLicencia.setCantidad(cantidad);

        // Recalcular total
        calcularTotal(carrito);

        Pedido carritoActualizado = pedidoRepository.save(carrito);

        System.out.println("Cantidad actualizada. Nuevo total: " + carritoActualizado.getTotal());

        return carritoActualizado;
    }
}