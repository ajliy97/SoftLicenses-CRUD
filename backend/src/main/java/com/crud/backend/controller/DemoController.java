package com.crud.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoController {

    @GetMapping("/api/secure/hello")
    public String hello() {
        return "Hola autenticado";
    }

    @GetMapping("/api/admin/dashboard")
    public String admin() {
        return "Zona admin";
    }
}