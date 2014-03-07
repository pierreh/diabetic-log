package org.diabeticlog.api;

public class VersionVo {

   private String version;

   public VersionVo() {
   }

   public VersionVo(String version) {
      this.version = version;
   }

   public String getVersion() {
      return version;
   }

   public void setVersion(String version) {
      this.version = version;
   }
}
