package com.team8.project2.domain.link.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LinkReqDTO {
    @NotNull
    private String url;
}
