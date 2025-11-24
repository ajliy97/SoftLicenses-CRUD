package com.crud.backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "licencia")
public class Licencia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "licencia_id")
    private Long licenciaId;

    @Column(name = "imagen_url")
    private String imagenUrl;

    @Column(unique = true)
    private String nombre;
    private String descripcion;
    private String categoria;
    private Double precio;
    private Integer cantidad_stock;
    
    private String tipo_licencia;
    private String tiempo_duracion;
    

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime  fecha_creacion;

    @UpdateTimestamp
    private LocalDateTime fecha_actualizacion;
    
    public Licencia (){        
    }

    public Licencia(Long licenciaId, String imagenUrl, String nombre, String descripcion, String categoria,
            Double precio, Integer cantidad_stock, String tipo_licencia, String tiempo_duracion,
            LocalDateTime fecha_creacion, LocalDateTime fecha_actualizacion) {
        this.licenciaId = licenciaId;
        this.imagenUrl = imagenUrl;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.precio = precio;
        this.cantidad_stock = cantidad_stock;
        this.tipo_licencia = tipo_licencia;
        this.tiempo_duracion = tiempo_duracion;
        this.fecha_creacion = fecha_creacion;
        this.fecha_actualizacion = fecha_actualizacion;
    }

    public Licencia(String imagenUrl, String nombre, String descripcion, String categoria, Double precio,
            Integer cantidad_stock, String tipo_licencia, String tiempo_duracion, LocalDateTime fecha_creacion,
            LocalDateTime fecha_actualizacion) {
        this.imagenUrl = imagenUrl;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.precio = precio;
        this.cantidad_stock = cantidad_stock;
        this.tipo_licencia = tipo_licencia;
        this.tiempo_duracion = tiempo_duracion;
        this.fecha_creacion = fecha_creacion;
        this.fecha_actualizacion = fecha_actualizacion;
    }

    public Long getId() {
        return licenciaId;
    }

    public void setId(Long licenciaId) {
        this.licenciaId = licenciaId;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public Integer getCantidad_stock() {
        return cantidad_stock;
    }

    public void setCantidad_stock(Integer cantidad_stock) {
        this.cantidad_stock = cantidad_stock;
    }

    public String getTipo_licencia() {
        return tipo_licencia;
    }

    public void setTipo_licencia(String tipo_licencia) {
        this.tipo_licencia = tipo_licencia;
    }

    public String getTiempo_duracion() {
        return tiempo_duracion;
    }

    public void setTiempo_duracion(String tiempo_duracion) {
        this.tiempo_duracion = tiempo_duracion;
    }

    public LocalDateTime getFecha_creacion() {
        return fecha_creacion;
    }

    public void setFecha_creacion(LocalDateTime fecha_creacion) {
        this.fecha_creacion = fecha_creacion;
    }

    public LocalDateTime getFecha_actualizacion() {
        return fecha_actualizacion;
    }

    public void setFecha_actualizacion(LocalDateTime fecha_actualizacion) {
        this.fecha_actualizacion = fecha_actualizacion;
    }

    
    
}
