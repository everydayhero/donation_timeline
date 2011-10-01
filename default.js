(function($) {
  var Donation = Backbone.Model.extend({});
  
  var Donations = Backbone.Collection.extend({
    model: Donation,
    
    url: 'http://edh:zIMPPITCxQIUDYUFFzeW@localhost:3001/api/v1/donations.json?callback=?',
        
    initialize: function() {
      this.bind('reset', function() { this.maxLength = this.length });
      this.bind('add', this.pop);
    },
    
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
    },
    
    pop: function() {
      if (this.length > this.maxLength) this.remove(this.first());
    }
  });
  
  var donations = new Donations();
    
  var DonationView = Backbone.View.extend({
    tagName: 'li',
    
    initialize: function() {
      this.model.bind('remove', this.remove, this);
    },
    
    render: function() {
      $(this.el).html(_.template($('#donation-view').html(), this.model.attributes));
      return this;
    }
  });
  
  var DonationsView = Backbone.View.extend({
    el: 'ol',
    
    initialize: function() {
      donations.bind('reset', this.concat, this);
      donations.bind('add', this.unshift, this);
    },
    
    concat: function() {
      donations.each(this.unshift, this);
    },
        
    unshift: function(donation) {
      var view = new DonationView({model: donation});
      $(this.el).prepend(view.render().el);
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
      }, 5000);
    }
  });
  
  $(function() {
    new AppView();
  });
})(Zepto);
