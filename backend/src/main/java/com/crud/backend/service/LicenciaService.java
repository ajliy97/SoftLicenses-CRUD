package com.crud.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.crud.backend.model.Licencia;
import com.crud.backend.repository.LicenciaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class LicenciaService {

    @Autowired
    LicenciaRepository licenciaRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<Licencia> getLicencias() {
        return this.licenciaRepository.findAll();
    }

    public ResponseEntity<Object> newLicencia(Licencia licencia) {
        HashMap<String, Object> datos = new HashMap<>();
        Optional<Licencia> res = licenciaRepository.findByNombre(licencia.getNombre());
        
        if (res.isPresent() && licencia.getId() == null) {
            datos.put("error", true);
            datos.put("message", "Ya existe una licencia con ese nombre");
            return new ResponseEntity<>(datos, HttpStatus.CONFLICT);
        }
        
        Licencia nuevaLicencia = licenciaRepository.save(licencia);
        datos.put("data", nuevaLicencia);
        
        if (licencia.getId() != null) {
            datos.put("message", "Se ha actualizado con éxito");
        } else {
            datos.put("message", "Se ha registrado con éxito");
        }
        
        return new ResponseEntity<>(datos, HttpStatus.CREATED);
    }

    @Transactional
    public ResponseEntity<Object> deletelicencia(Long licenciaId) {
        HashMap<String, Object> datos = new HashMap<>();
        
        if (!licenciaRepository.existsById(licenciaId)) {
            datos.put("error", true);
            datos.put("message", "No existe licencia con id " + licenciaId);
            return new ResponseEntity<>(datos, HttpStatus.NOT_FOUND);
        }

        try {
            // Primero eliminar referencias en pedido_licencia
            entityManager.createNativeQuery(
                "DELETE FROM pedido_licencia WHERE licencia_id = :licenciaId"
            ).setParameter("licenciaId", licenciaId).executeUpdate();

            // Ahora eliminar la licencia
            licenciaRepository.deleteById(licenciaId);
            
            datos.put("message", "Licencia eliminada exitosamente");
            return new ResponseEntity<>(datos, HttpStatus.ACCEPTED);
            
        } catch (Exception e) {
            datos.put("error", true);
            datos.put("message", "Error al eliminar: " + e.getMessage());
            return new ResponseEntity<>(datos, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}