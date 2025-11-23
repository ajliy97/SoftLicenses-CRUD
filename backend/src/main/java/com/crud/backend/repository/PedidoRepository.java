package com.crud.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.crud.backend.model.Pedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Buscar todos los pedidos de un usuario - SQL NATIVO con CAST
    @Query(value = "SELECT * FROM pedido WHERE CAST(usuario_id AS BIGINT) = :usuarioId", nativeQuery = true)
    List<Pedido> findByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    // Buscar pedido por usuario y estado - SQL NATIVO con CAST
    @Query(value = "SELECT * FROM pedido WHERE CAST(usuario_id AS BIGINT) = :usuarioId AND estado = :estado LIMIT 1", nativeQuery = true)
    Optional<Pedido> findByUsuarioIdAndEstado(
        @Param("usuarioId") Long usuarioId, 
        @Param("estado") String estado
    );
    
    // Buscar pedidos por estado
    @Query(value = "SELECT * FROM pedido WHERE estado = :estado", nativeQuery = true)
    List<Pedido> findByEstado(@Param("estado") String estado);
}