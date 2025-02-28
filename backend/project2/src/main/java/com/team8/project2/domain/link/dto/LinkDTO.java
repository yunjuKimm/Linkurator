package com.team8.project2.domain.link.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LinkDTO {
    @NotNull
    private String url;

    @NotNull
    private String title;

    @NotNull
    private String description;

    @NotNull
    private String thumbnail;

}
