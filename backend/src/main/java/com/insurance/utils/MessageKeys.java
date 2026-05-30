package com.insurance.utils;



/**
 * Message Keys cho i18n - Táº¥t cáº£ message key Ä‘Æ°á»£c dĂ¹ng trong á»©ng dá»¥ng
 * Organized by feature/entity type Ä‘á»ƒ dá»… dĂ ng tĂ¬m kiáº¿m vĂ  sáº¯p xáº¿p
 */
public class MessageKeys {

    // ==========================================
    // COMMON RESPONSE MESSAGES
    // ==========================================
    public static final String SUCCESS = "success";

    // ==========================================
    // AUTH MESSAGES
    // ==========================================
    public static final String LOGIN_SUCCESS = "auth.login.success";
    public static final String LOGIN_FAILED = "auth.login.failed";
    public static final String REGISTER_SUCCESS = "auth.register.success";
    public static final String LOGOUT_SUCCESS = "auth.logout.success";
    public static final String EMAIL_VERIFY_SUCCESS = "auth.email.verify.success";
    public static final String GOOGLE_LOGIN_SUCCESS = "auth.google.login.success";
    public static final String FACEBOOK_LOGIN_SUCCESS = "auth.facebook.login.success";
    public static final String AUTH_SEND_VERIFICATION_EMAIL_SUCCESS = "auth.send.verification.email.success";
    public static final String WRONG_EMAIL_PASSWORD = "auth.wrong.email.password";
    public static final String USER_LOCKED = "auth.user.locked";
    public static final String PASSWORD_NOT_MATCH = "auth.password.not.match";

    // ==========================================
    // USER MESSAGES
    // ==========================================
    public static final String USER_GET_ALL_SUCCESS = "user.get.all.success";
    public static final String USER_GET_SUCCESS = "user.get.success";
    public static final String USER_CREATE_SUCCESS = "user.create.success";
    public static final String USER_UPDATE_SUCCESS = "user.update.success";
    public static final String USER_DELETE_SUCCESS = "user.delete.success";
    public static final String USER_UPDATE_AVATAR_SUCCESS = "user.update.avatar.success";
    public static final String USER_GET_PROFILE_SUCCESS = "user.get.profile.success";
    public static final String USER_UPDATE_PROFILE_SUCCESS = "user.update.profile.success";
    public static final String USER_CHANGE_PASSWORD_SUCCESS = "user.change.password.success";
    public static final String USER_UPLOAD_AVATAR_SUCCESS = "user.upload.avatar.success";
    public static final String USER_DELETE_AVATAR_SUCCESS = "user.delete.avatar.success";
    public static final String USER_LOCK_SUCCESS = "user.lock.success";
    public static final String USER_UNLOCK_SUCCESS = "user.unlock.success";

    // ==========================================
    // EXCEPTION/ERROR MESSAGES
    // ==========================================
    public static final String DATA_NOT_FOUND = "exception.data.not.found";
    public static final String INVALID_PARAM = "exception.invalid.param";
    public static final String PERMISSION_DENIED = "exception.permission.denied";
    public static final String UNAUTHORIZED = "exception.unauthorized";
    public static final String CONFLICT = "exception.conflict";
    public static final String VALIDATION_ERROR = "exception.validation.error";
    public static final String RUNTIME_ERROR = "exception.runtime.error";
    public static final String INTERNAL_SERVER_ERROR = "exception.internal.server.error";

    // ==========================================
    // ATTRACTION MESSAGES
    // ==========================================
    public static final String ATTRACTION_GET_ALL_SUCCESS = "attraction.get.all.success";
    public static final String ATTRACTION_GET_SUCCESS = "attraction.get.success";
    public static final String ATTRACTION_CREATE_SUCCESS = "attraction.create.success";
    public static final String ATTRACTION_UPDATE_SUCCESS = "attraction.update.success";
    public static final String ATTRACTION_DELETE_SUCCESS = "attraction.delete.success";
    public static final String ATTRACTION_HARD_DELETE_SUCCESS = "attraction.hard.delete.success";
    public static final String ATTRACTION_HARD_DELETE_SUCCESS_FULL = "attraction.hard.delete.success.full";
    public static final String ATTRACTION_GET_FEATURED_SUCCESS = "attraction.get.featured.success";
    public static final String ATTRACTION_DELETE_GALLERY_IMAGE_SUCCESS = "attraction.delete.gallery.image.success";

    // ==========================================
    // HOTEL MESSAGES
    // ==========================================
    public static final String HOTEL_GET_ALL_SUCCESS = "hotel.get.all.success";
    public static final String HOTEL_GET_SUCCESS = "hotel.get.success";
    public static final String HOTEL_CREATE_SUCCESS = "hotel.create.success";
    public static final String HOTEL_UPDATE_SUCCESS = "hotel.update.success";
    public static final String HOTEL_DELETE_SUCCESS = "hotel.delete.success";
    public static final String HOTEL_HARD_DELETE_SUCCESS = "hotel.hard.delete.success";
    public static final String HOTEL_DELETE_GALLERY_IMAGE_SUCCESS = "hotel.delete.gallery.image.success";

    // ==========================================
    // RESTAURANT MESSAGES
    // ==========================================
    public static final String RESTAURANT_GET_ALL_SUCCESS = "restaurant.get.all.success";
    public static final String RESTAURANT_GET_SUCCESS = "restaurant.get.success";
    public static final String RESTAURANT_CREATE_SUCCESS = "restaurant.create.success";
    public static final String RESTAURANT_UPDATE_SUCCESS = "restaurant.update.success";
    public static final String RESTAURANT_DELETE_SUCCESS = "restaurant.delete.success";
    public static final String RESTAURANT_HARD_DELETE_SUCCESS = "restaurant.hard.delete.success";
    public static final String RESTAURANT_DELETE_GALLERY_IMAGE_SUCCESS = "restaurant.delete.gallery.image.success";

    // ==========================================
    // NEWS MESSAGES
    // ==========================================
    public static final String NEWS_GET_ALL_SUCCESS = "news.get.all.success";
    public static final String NEWS_GET_SUCCESS = "news.get.success";
    public static final String NEWS_CREATE_SUCCESS = "news.create.success";
    public static final String NEWS_UPDATE_SUCCESS = "news.update.success";
    public static final String NEWS_DELETE_SUCCESS = "news.delete.success";
    public static final String NEWS_GET_BY_CATEGORY_SUCCESS = "news.get.by.category.success";
    public static final String NEWS_SEARCH_SUCCESS = "news.search.success";
    public static final String NEWS_UPDATE_FEATURED_SUCCESS = "news.update.featured.success";

    // ==========================================
    // REVIEW MESSAGES
    // ==========================================
    public static final String REVIEW_GET_ALL_SUCCESS = "review.get.all.success";
    public static final String REVIEW_GET_SUCCESS = "review.get.success";
    public static final String REVIEW_CREATE_SUCCESS = "review.create.success";
    public static final String REVIEW_UPDATE_SUCCESS = "review.update.success";
    public static final String REVIEW_DELETE_SUCCESS = "review.delete.success";
    public static final String REVIEW_UPDATE_STATUS_SUCCESS = "review.update.status.success";
    public static final String REVIEW_HIDE_SUCCESS = "review.hide.success";
    public static final String REVIEW_SHOW_SUCCESS = "review.show.success";
    public static final String REVIEW_DELETE_GALLERY_IMAGE_SUCCESS = "review.delete.gallery.image.success";

    // ==========================================
    // FAVORITE LOCATION MESSAGES
    // ==========================================
    public static final String FAVORITE_GET_ALL_SUCCESS = "favorite.get.all.success";
    public static final String FAVORITE_ADDED_SUCCESS = "favorite.added.success";
    public static final String FAVORITE_REMOVED_SUCCESS = "favorite.removed.success";
    public static final String FAVORITE_CHECK_SUCCESS = "favorite.check.success";
    public static final String FAVORITE_COUNT_SUCCESS = "favorite.count.success";

    // ==========================================
    // SEARCH MESSAGES
    // ==========================================
    public static final String SEARCH_ATTRACTION_BY_NAME = "search.attraction.by.name";
    public static final String SEARCH_ATTRACTION_BY_LOCATION = "search.attraction.by.location";
    public static final String SEARCH_ATTRACTION_BY_KEYWORD = "search.attraction.by.keyword";
    public static final String SEARCH_ATTRACTION_BY_NAME_PROVINCE = "search.attraction.by.name.province";
    public static final String SEARCH_ATTRACTION_BY_LOCATION_PROVINCE = "search.attraction.by.location.province";

    public static final String SEARCH_RESTAURANT_BY_NAME = "search.restaurant.by.name";
    public static final String SEARCH_RESTAURANT_BY_LOCATION = "search.restaurant.by.location";
    public static final String SEARCH_RESTAURANT_BY_KEYWORD = "search.restaurant.by.keyword";
    public static final String SEARCH_RESTAURANT_BY_NAME_PROVINCE = "search.restaurant.by.name.province";
    public static final String SEARCH_RESTAURANT_BY_LOCATION_PROVINCE = "search.restaurant.by.location.province";

    public static final String SEARCH_HOTEL_BY_NAME = "search.hotel.by.name";
    public static final String SEARCH_HOTEL_BY_LOCATION = "search.hotel.by.location";
    public static final String SEARCH_HOTEL_BY_KEYWORD = "search.hotel.by.keyword";
    public static final String SEARCH_HOTEL_BY_NAME_PROVINCE = "search.hotel.by.name.province";
    public static final String SEARCH_HOTEL_BY_LOCATION_PROVINCE = "search.hotel.by.location.province";

    // ==========================================
    // ITINERARY MESSAGES
    // ==========================================
    public static final String ITINERARY_GENERATE_SUCCESS = "itinerary.generate.success";
    public static final String ITINERARY_GET_SUCCESS = "itinerary.get.success";
    public static final String ITINERARY_GET_MY_ITINERARIES_SUCCESS = "itinerary.get.my.itineraries.success";
    public static final String ITINERARY_GET_SAMPLES_SUCCESS = "itinerary.get.samples.success";
    public static final String ITINERARY_GET_ALL_SUCCESS = "itinerary.get.all.success";
    public static final String ITINERARY_PUBLISH_SUCCESS = "itinerary.publish.success";
    public static final String ITINERARY_DELETE_SUCCESS = "itinerary.delete.success";
    public static final String ITINERARY_UPDATE_SUCCESS = "itinerary.update.success";
    public static final String ITINERARY_UPDATE_STATUS_SUCCESS = "itinerary.update.status.success";

    // ==========================================
    // NEARBY SERVICE MESSAGES
    // ==========================================
    public static final String NEARBY_SERVICE_GET_ALL_SUCCESS = "nearby.service.get.all.success";
    public static final String NEARBY_SERVICE_GET_ATTRACTION_SUCCESS = "nearby.service.get.attraction.success";
    public static final String NEARBY_SERVICE_GET_ATTRACTION_BY_TYPE_SUCCESS = "nearby.service.get.attraction.by.type.success";
    public static final String NEARBY_SERVICE_GET_HOTEL_SUCCESS = "nearby.service.get.hotel.success";
    public static final String NEARBY_SERVICE_GET_HOTEL_BY_TYPE_SUCCESS = "nearby.service.get.hotel.by.type.success";
    public static final String NEARBY_SERVICE_GET_RESTAURANT_SUCCESS = "nearby.service.get.restaurant.success";
    public static final String NEARBY_SERVICE_GET_RESTAURANT_BY_TYPE_SUCCESS = "nearby.service.get.restaurant.by.type.success";
    public static final String NEARBY_SERVICE_GET_BY_TYPE_SUCCESS = "nearby.service.get.by.type.success";
    public static final String NEARBY_SERVICE_GET_DETAIL_SUCCESS = "nearby.service.get.detail.success";
    public static final String NEARBY_SERVICE_CREATE_SUCCESS = "nearby.service.create.success";
    public static final String NEARBY_SERVICE_UPDATE_SUCCESS = "nearby.service.update.success";
    public static final String NEARBY_SERVICE_DELETE_SUCCESS = "nearby.service.delete.success";

    // ==========================================
    // OSM IMPORT MESSAGES
    // ==========================================
    public static final String OSM_IMPORT_HOTEL_SUCCESS = "osm.import.hotel.success";
    public static final String OSM_IMPORT_HOTEL_FAILED = "osm.import.hotel.failed";
    public static final String OSM_IMPORT_RESTAURANT_SUCCESS = "osm.import.restaurant.success";
    public static final String OSM_IMPORT_RESTAURANT_FAILED = "osm.import.restaurant.failed";
    public static final String OSM_IMPORT_ATTRACTION_SUCCESS = "osm.import.attraction.success";
    public static final String OSM_IMPORT_ATTRACTION_FAILED = "osm.import.attraction.failed";
    public static final String OSM_IMPORT_DATA_FAILED = "osm.import.data.failed";

    // ==========================================
    // PASSWORD & OTP MESSAGES
    // ==========================================
    public static final String OTP_SEND_SUCCESS = "otp.send.success";
    public static final String OTP_VERIFY_SUCCESS = "otp.verify.success";
    public static final String PASSWORD_RESET_SUCCESS = "password.reset.success";

    // ==========================================
    // DEPRECATED MESSAGES (for backward compatibility)
    // ==========================================
    @Deprecated
    public static final String LOGIN_SUCCESSFULLY = "user.login.login_successfully";
    @Deprecated
    public static final String REGISTER_SUCCESSFULLY = "user.login.register_successfully";
    @Deprecated
    public static final String LOGIN_FAILED_OLD = "user.login.login_failed";
    @Deprecated
    public static final String WRONG_PHONE_PASSWORD = "user.login.wrong_phone_password";
    @Deprecated
    public static final String ROLE_DOES_NOT_EXISTS = "user.login.role_not_exist";
    @Deprecated
    public static final String USER_IS_LOCKED = "user.login.user_is_locked";
}
