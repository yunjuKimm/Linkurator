package com.team8.project2.domain.curation.dto;

import com.team8.project2.domain.link.dto.LinkReqDTO;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CurationReqDTO {

    @NotNull
    private String title;

    @NotNull
    private String content;

    private List<LinkReqDTO> linkReqDtos;
}
