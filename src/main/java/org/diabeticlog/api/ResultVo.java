package org.diabeticlog.api;

public class ResultVo {

   public static final int OK = 0;
   public static final int ERROR = 1;

   private int code;
   private String message;

   public ResultVo() {
      code = OK;
   }

   public static ResultVo success(String message) {
      return new ResultVo(OK, message);
   }

   public static ResultVo error(String message) {
      return new ResultVo(ERROR, message);
   }

   public int getCode() {
      return code;
   }

   public void setCode(int code) {
      this.code = code;
   }

   public String getMessage() {
      return message;
   }

   public void setMessage(String message) {
      this.message = message;
   }

   protected ResultVo(int code, String message) {
      this.code = code;
      this.message = message;
   }

}
