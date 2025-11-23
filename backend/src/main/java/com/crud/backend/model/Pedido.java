package com.crud.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
  
@Entity
@Table(name = "pedido")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pedido_id")
    private Long pedidoId;

    @Column(nullable = false)
    private Double total = 0.0;
    
    @Column(nullable = false)
    private String estado = "carrito";

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @CreationTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"pedidos", "hibernateLazyInitializer", "handler"})
    private Usuario usuario;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"pedido", "usuario"})
    private List<PedidoLicencia> pedidoLicencias = new ArrayList<>();

    
    public Pedido() {
        this.total = 0.0;
        this.estado = "carrito";
    }


    public Long getId() {
        return pedidoId;
    }


    public void setId(Long pedidoId) {
        this.pedidoId = pedidoId;
    }


    public Double getTotal() {
        return total;
    }


    public void setTotal(Double total) {
        this.total = total;
    }


    public String getEstado() {
        return estado;
    }


    public void setEstado(String estado) {
        this.estado = estado;
    }


    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }


    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }


    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }


    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }


    public Usuario getUsuario() {
        return usuario;
    }


    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }


    public List<PedidoLicencia> getPedidoLicencias() {
        return pedidoLicencias;
    }


    public void setPedidoLicencias(List<PedidoLicencia> pedidoLicencias) {
        this.pedidoLicencias = pedidoLicencias;
    }

    
}