package org.diabeticlog.api;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.Named;
import com.google.appengine.api.oauth.OAuthRequestException;
import com.google.appengine.api.users.User;
import model.ModelStore;

@Api(
      name = Constants.API_NAME,
      version = Constants.API_VERSION,
      scopes = Constants.EMAIL_SCOPE,
      clientIds = {Constants.WEB_CLIENT_ID, Constants.API_EXPLORER_CLIENT_ID}
)
public class SyncApi {

   private ModelStore modelStore;

   public ResultVo updateDay(DayVo day, User user) throws OAuthRequestException {
      if (user == null) {
         throw new OAuthRequestException("not logged in");
      }
      modelStore.storeDay(day, user);
      return new ResultVo();
   }

   public User getUsername(User user) throws OAuthRequestException {
      if (user == null) {
         throw new OAuthRequestException("not logged in");
      }
      return user;
   }

   public VersionVo getVersion() {
      return new VersionVo(Constants.API_VERSION);
   }
}
