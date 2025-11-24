package com.crud.backend.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.crud.backend.model.Licencia;

@Repository
public interface LicenciaRepository extends JpaRepository<Licencia, Long> {

    //@Query ("SELECT * FROM Product p WHERE p.name= ?1")
    Optional <Licencia> findByNombre(String nombre);
    
}