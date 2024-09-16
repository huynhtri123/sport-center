package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.SportRequestDTO;
import app.sportcenter.services.SportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sport")
public class SportController {
    @Autowired
    private SportService sportService;

    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody SportRequestDTO sportRequestDTO) {
        return sportService.create(sportRequestDTO);
    }
}
