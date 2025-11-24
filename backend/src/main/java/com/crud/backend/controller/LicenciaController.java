package com.crud.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crud.backend.model.Licencia;
import com.crud.backend.service.LicenciaService;

@RestController
@RequestMapping("api/v1/licencia")
public class LicenciaController {

    private final LicenciaService licenciaService;

    @Autowired
    public LicenciaController(LicenciaService licenciaService){
        this.licenciaService = licenciaService;
    }

    @GetMapping
    public List<Licencia> getLicencias(){
        return this.licenciaService.getLicencias();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")  // Solo ADMIN
    public ResponseEntity<Object> registrarLicencia(@RequestBody Licencia licencia){
        return this.licenciaService.newLicencia(licencia);
    }

    @PutMapping("/{licenciaId}")  
    @PreAuthorize("hasRole('ADMIN')")  // Solo ADMIN
    public ResponseEntity<Object> actualizarLicencia(
            @PathVariable("licenciaId") Long licenciaId,
            @RequestBody Licencia licencia) {
        licencia.setId(licenciaId);  // Asegura que se use el ID correcto
        return this.licenciaService.newLicencia(licencia);
    }

    @DeleteMapping("/{licenciaId}")  
    @PreAuthorize("hasRole('ADMIN')")  // Solo ADMIN
    public ResponseEntity<Object> eliminarLicencia(@PathVariable("licenciaId") Long licenciaId){
        return this.licenciaService.deletelicencia(licenciaId);
    }
}