package model;

import com.google.appengine.api.NamespaceManager;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.User;
import org.diabeticlog.api.DayVo;
import org.diabeticlog.api.EntryVo;

import java.util.logging.Level;
import java.util.logging.Logger;

public class ModelStore {

   private final static Logger logger = Logger.getLogger(ModelStore.class.getName());

   private final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

   public void storeDay(DayVo day, User user) {
      NamespaceManager.set(user.getUserId());
      Transaction txn = datastore.beginTransaction();
      try {
         Entity dayEnt = new Entity(DayVo.ENTITY_KIND, day.getDate().getTime());
         datastore.put(dayEnt);
         for (EntryVo entry: day.getEntries()) {
            Entity entryEnt = new Entity(EntryVo.ENTITY_KIND, entry.getTime(), dayEnt.getKey());
            entryEnt.setProperty(EntryVo.PROPERTY_TIME, entry.getTime());
            entryEnt.setProperty(EntryVo.PROPERTY_GLUCOSE, entry.getGlucose() != null ? entry.getGlucose().toPlainString() : null);
            entryEnt.setProperty(EntryVo.PROPERTY_ACTRAPID, entry.getActrapid() != null ? entry.getActrapid().toPlainString() : null);
            entryEnt.setProperty(EntryVo.PROPERTY_INSULATARD, entry.getInsulatard() != null ? entry.getInsulatard().toPlainString() : null);
            entryEnt.setProperty(EntryVo.PROPERTY_COMMENTS, entry.getComments() != null ? new Text(entry.getComments()) : null);
            datastore.put(entryEnt);
         }

         txn.commit();
         logger.info("Day stored : " + day.getDate().toGMTString());

      } catch(Exception e) {
         logger.log(Level.SEVERE, "Exception while storing day " + day.getDate().toGMTString(), e);
      } finally {
         if (txn.isActive()) {
            txn.rollback();
            throw new IllegalStateException("Transaction rolled back for day " + day.getDate().toGMTString());
         }
      }
   }


}
