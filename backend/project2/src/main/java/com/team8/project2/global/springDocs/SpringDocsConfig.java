package com.team8.project2.global.springDocs;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(title = "Project2 API 문서", version = "v1", description = "팀8의 프로젝트 API 문서입니다."))
public class SpringDocsConfig {

    @Bean
    public GroupedOpenApi groupApiV1() {
        return GroupedOpenApi.builder()
                .group("api-v1")
                .pathsToMatch("/api/v1/**") // /api/v1/** 패턴의 경로만 문서화
                .build();
    }

    @Bean
    public GroupedOpenApi groupController() {
        return GroupedOpenApi.builder()
                .group("controller")
                .pathsToExclude("/api/**") // /api/** 패턴 제외
                .build();
    }
}
