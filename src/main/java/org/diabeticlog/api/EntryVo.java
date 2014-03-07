package org.diabeticlog.api;

import java.math.BigDecimal;
import java.util.Date;

public class EntryVo {
   private String time;
   private BigDecimal glucose;
   private BigDecimal actrapid;
   private BigDecimal insulatard;
   private String comments;

   public String getTime() {
      return time;
   }

   public void setTime(String time) {
      this.time = time;
   }

   public BigDecimal getGlucose() {
      return glucose;
   }

   public void setGlucose(BigDecimal glucose) {
      this.glucose = glucose;
   }

   public BigDecimal getActrapid() {
      return actrapid;
   }

   public void setActrapid(BigDecimal actrapid) {
      this.actrapid = actrapid;
   }

   public BigDecimal getInsulatard() {
      return insulatard;
   }

   public void setInsulatard(BigDecimal insulatard) {
      this.insulatard = insulatard;
   }

   public String getComments() {
      return comments;
   }

   public void setComments(String comments) {
      this.comments = comments;
   }
}
