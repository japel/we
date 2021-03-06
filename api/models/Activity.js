/**
 * Activity.js
 *
 * @description :: Activity based on activitystrea.ms: http://activitystrea.ms/specs/json/1.0/
 * @docs		:: http://activitystrea.ms/specs/json/1.0/
 */

module.exports = {
  schema: true,
	attributes: {
    active:{
      type: 'boolean',
      defaultsTo: true
    },

    title: {
      type: 'string'
    },

    actor: {
      type: 'string'
    },

    // activity object type exemple: post, user, comment ...
    verb: {
      type: 'string'
    },

    target_id: {
      type: 'string'
    },
    // Override toJSON instance method
    toJSON: function() {

      var obj = this.toObject();

      if( _.isObject(obj.actor) ){
        obj.actor_id = obj.actor.id;
      } else {
        obj.actor_id = obj.actor;
      }

      return obj;
    }

	},
  // After register one activity
  afterCreate: function(activity, next) {
    // TODO change to friends only
    //sails.io.sockets.in('user_activity_' + activity.actor).emit(
    if( _.isObject(activity.actor) ){
      activity.actor_id = activity.actor.id;
    } else {
      activity.actor_id = activity.actor;
    }

    Activity.fetchData(activity, function(){
      sails.io.sockets.in('public').emit(
        'activity:new',
        {
          item: activity
        }
      );
    });

    next();
  },

  fetchData: function(activity, callback){
    Users.findOneById(activity.actor)
    .exec(function(err, dbActor) {
      if(err){
        sails.log.error('ActivityController:index: error on get actors: ',err);
        callback(err);
      }

      if(activity.actor){
        activity.actor = dbActor.toJSON();
      }

      // is a post activity get the target post
      if( activity.verb ){
        sails.models[activity.verb].findOneById(activity.target_id).exec(function(err, targetObject){
          if(err){
            sails.log.error('ActiviryController:index: erros on get targetObject from activity: ',activity, err)
            return callback(err);
          }

          // if dont targetObject is not found return a empty object
          if(!targetObject){
            activity.target = {};
            return callback();
          }

          // convert to json and set default variables
          targetObject = targetObject.toJSON();

          activity.target = targetObject;
          // set some Activity streams values
          if(targetObject.text){
            activity.target.displayName = targetObject.text;
          } else if(targetObject.comment) {
            activity.target.displayName = targetObject.comment;
          }

          // if is comment load comment target object from db
          if(activity.verb == 'comment'){
            Comment.getTargetFromDb( targetObject, function(err, commentTarget){
              if(err){
                sails.log.error(err);
              }
              activity.target.model = commentTarget;
              callback();
            });
          }else{
            callback();
          }

        });
      }else{
        callback();
      }
    });
  }
};
