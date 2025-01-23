package app.sportcenter.models.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class VnpayResponse implements Serializable {
    private String status;
    private String message;
    private String URL;
}
