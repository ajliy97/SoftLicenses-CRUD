package com.crud.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crud.backend.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    //No eliminar sino no se muestran las licencias
    Optional <Usuario> findByNombre(String nombre);
    Boolean existsByNombre(String nombre);

    Optional <Usuario> findByEmail(String email);
    Boolean existsByEmail(String email);

}
