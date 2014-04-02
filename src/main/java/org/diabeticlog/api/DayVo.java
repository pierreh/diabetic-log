package org.diabeticlog.api;

import java.util.Date;
import java.util.List;

public class DayVo {

   public static final String ENTITY_KIND = "Day";

   private String date;
   private List<EntryVo> entries;

   public String getDate() {
      return date;
   }

   public void setDate(String date) {
      this.date = date;
   }

   public List<EntryVo> getEntries() {
      return entries;
   }

   public void setEntries(List<EntryVo> entries) {
      this.entries = entries;
   }
}
