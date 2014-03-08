package model;

import com.google.appengine.api.NamespaceManager;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.User;
import org.diabeticlog.api.DayVo;
import org.diabeticlog.api.EntryVo;

public class ModelStore {

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
            entryEnt.setProperty(EntryVo.PROPERTY_GLUCOSE, entry.getGlucose().toPlainString());
            entryEnt.setProperty(EntryVo.PROPERTY_ACTRAPID, entry.getActrapid().toPlainString());
            entryEnt.setProperty(EntryVo.PROPERTY_INSULATARD, entry.getInsulatard().toPlainString());
            entryEnt.setProperty(EntryVo.PROPERTY_COMMENTS, new Text(entry.getComments()));
            datastore.put(entryEnt);
         }

         txn.commit();
      } finally {
         if (txn.isActive()) {
            txn.rollback();
         }
      }
   }


}
