(function($) {
  var Donation = Backbone.Model.extend({});
  
  var Donations = Backbone.Collection.extend({
    model: Donation,
    
    url: 'https://<API_USERNAME>:<API_TOKEN>@heroix.everydayhero.com.au/api/v1/donations.json?callback=?',
    
    comparator: function(donation) {
      return donation.get('id');
    },

    parse: function(response) {
      var self = this;
      return _(response).reject(function(result) {
        return _(self.models).detect(function(model) {
          return result.id === model.id;
        });
      });
    }
  });
  
  var donations = new Donations();
    
  var DonationView = Backbone.View.extend({
    tagName: 'li',
    
    render: function() {
      $(this.el).html(_.template($('#donation-view').html(), this.model.attributes));
      return this;
    }
  });
  
  var DonationsView = Backbone.View.extend({
    el: 'ol',
    
    multiplier: 1,
    
    initialize: function() {
      donations.bind('reset', this.concat, this);
      donations.bind('add', this.push, this);
      donations.bind('add', this.animiate, this);
    },
    
    concat: function() {
      donations.each(this.push, this);
    },
        
    push: function(donation, animate) {
      var view = new DonationView({model: donation});
      $(this.el).append(view.render().el);
    },
    
    animiate: function() {
      $(this.el).anim({translateY: '-' + this.multiplier++ * 100 + 'px'}, 3, 'ease-in-out');
    }
  });
  
  var AppView = Backbone.View.extend({
    el: 'body',
    
    initialize: function() {
      new DonationsView();
      var self = this;
      donations.fetch({success: function() {
        self.poll();
      }});
    },
    
    poll: function() {
      var self = this;
      _.delay(function() {
        donations.fetch({add: true, success: function() {
          self.poll();
        }});
      }, 30000);
    }
  });
  
  $(function() {
    new AppView();
  });
})(Zepto);
