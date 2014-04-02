package model;

import com.google.appengine.api.NamespaceManager;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.User;
import org.diabeticlog.api.DayVo;
import org.diabeticlog.api.EntryVo;

import java.math.BigDecimal;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ModelStore {

   private final static Logger logger = Logger.getLogger(ModelStore.class.getName());

   private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

   public void storeDay(DayVo day, User user) {
      NamespaceManager.set(user.getUserId());
      Transaction txn = datastore.beginTransaction();
      try {
         Entity dayEnt = new Entity(DayVo.ENTITY_KIND, day.getDate());
         removeEntries(dayEnt.getKey());
         datastore.put(dayEnt);
         for (EntryVo entry: day.getEntries()) {
            Entity entryEnt = new Entity(EntryVo.ENTITY_KIND, entry.getTime(), dayEnt.getKey());
            entryEnt.setProperty(EntryVo.PROPERTY_TIME, entry.getTime());
            entryEnt.setProperty(EntryVo.PROPERTY_GLUCOSE, bigdecimal2String(entry.getGlucose()));
            entryEnt.setProperty(EntryVo.PROPERTY_ACTRAPID, bigdecimal2String(entry.getActrapid()));
            entryEnt.setProperty(EntryVo.PROPERTY_INSULATARD, bigdecimal2String(entry.getInsulatard()));
            entryEnt.setProperty(EntryVo.PROPERTY_COMMENTS, string2Text(entry.getComments()));
            datastore.put(entryEnt);
         }

         txn.commit();
         logger.info("Day stored : " + day.getDate());

      } catch(Exception e) {
         logger.log(Level.SEVERE, "Exception while storing day " + day.getDate(), e);
      } finally {
         if (txn.isActive()) {
            txn.rollback();
            throw new IllegalStateException("Transaction rolled back for day " + day.getDate());
         }
      }
   }

   public DayVo getDay(String date) throws EntityNotFoundException {
      Entity dayEnt = datastore.get(KeyFactory.createKey(DayVo.ENTITY_KIND, date));
      DayVo dayVo = new DayVo();
      dayVo.setDate(date);
      Query q = new Query(DayVo.ENTITY_KIND).setAncestor(dayEnt.getKey());
      for (Entity entryEnt : datastore.prepare(q).asIterable()) {
         EntryVo e = new EntryVo();
         e.setTime((String) entryEnt.getProperty(EntryVo.PROPERTY_TIME));
         e.setGlucose(string2Bigdecimal((String) entryEnt.getProperty(EntryVo.PROPERTY_GLUCOSE)));
         e.setActrapid(string2Bigdecimal((String) entryEnt.getProperty(EntryVo.PROPERTY_ACTRAPID)));
         e.setInsulatard(string2Bigdecimal((String) entryEnt.getProperty(EntryVo.PROPERTY_INSULATARD)));
         e.setComments(text2String((Text) entryEnt.getProperty(EntryVo.PROPERTY_COMMENTS)));
         dayVo.getEntries().add(e);
      }
      return dayVo;
   }

   private void removeEntries(Key dayKey) {
      Query q = new Query(DayVo.ENTITY_KIND).setAncestor(dayKey).setKeysOnly();
      for (Entity entryEnt : datastore.prepare(q).asIterable()) {
         datastore.delete(entryEnt.getKey());
      }
   }

   private static String bigdecimal2String(BigDecimal decimal) {
      return decimal != null ? decimal.toPlainString() : null;
   }

   private static BigDecimal string2Bigdecimal(String string) {
      return string != null ? new BigDecimal(string) : null;
   }

   private static Text string2Text(String string) {
      return string != null ? new Text(string) : null;
   }

   private static String text2String(Text text) {
      return text != null ? text.getValue() : null;
   }

}
