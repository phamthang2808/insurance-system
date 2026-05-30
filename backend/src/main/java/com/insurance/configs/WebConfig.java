package com.insurance.configs;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
//@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebConfig implements WebMvcConfigurer {

    //    private final FileUploadProperties fileUploadProperties;
//
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ThÆ° má»¥c uploads tá»« configuration
//        Path uploadDir = Paths.get(fileUploadProperties.getUploadDir());
//        String absolute = uploadDir.toFile().getAbsolutePath();
//
//        String uploadPath = "/" + fileUploadProperties.getUploadDir() + "/**";
//
//        registry.addResourceHandler(uploadPath)
//                .addResourceLocations("file:" + absolute + "/");
//
//        // Náº¿u FE cĂ³ gá»i kiá»ƒu http://host:8088/api/uploads/...
//        registry.addResourceHandler("/api" + uploadPath)
//                .addResourceLocations("file:" + absolute + "/");

        registry.addResourceHandler("/api/v1/users/images/**")
                .addResourceLocations("file:uploads/users/");


    }

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
        localeResolver.setSupportedLocales(Arrays.asList(
                Locale.forLanguageTag("vi"),  // Tiáº¿ng Viá»‡t
                Locale.forLanguageTag("en")   // English
        ));
        localeResolver.setDefaultLocale(Locale.forLanguageTag("vi")); // Máº·c Ä‘á»‹nh: tiáº¿ng Viá»‡t
        return localeResolver;
    }

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:i18n/messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(3600); // Cache 1 giá»
        messageSource.setFallbackToSystemLocale(false); // KhĂ´ng fallback vá» system locale
        return messageSource;
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // String Converter with UTF-8
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(StandardCharsets.UTF_8);
        stringConverter.setDefaultCharset(StandardCharsets.UTF_8);
        converters.add(0, stringConverter);

        // JSON Converter with UTF-8
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        jsonConverter.setDefaultCharset(StandardCharsets.UTF_8);
        jsonConverter.setSupportedMediaTypes(List.of(
                new MediaType("application", "json", StandardCharsets.UTF_8),
                new MediaType("application", "*+json", StandardCharsets.UTF_8)
        ));
        converters.add(1, jsonConverter);
    }

    @Bean
    public FilterRegistrationBean<CharacterEncodingFilter> customCharacterEncodingFilter() {
        FilterRegistrationBean<CharacterEncodingFilter> registrationBean = new FilterRegistrationBean<>();
        CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
        characterEncodingFilter.setEncoding(StandardCharsets.UTF_8.name());
        characterEncodingFilter.setForceEncoding(true);
        registrationBean.setFilter(characterEncodingFilter);
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }

}

