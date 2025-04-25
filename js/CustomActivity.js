define(['postmonger'], function(Postmonger) {
    'use strict';
  
    const connection = new Postmonger.Session();
    let payload = {};
    const steps      = [
        { label: "Configure Message", key: "messageBody" }
    ];
    console.log("testing 1");    
   
    // When the page loads…
    $(window).ready(onRender);

    // Journey Builder events
    connection.on('initActivity',      initialize);
    connection.on('clickedNext',       save);
    connection.on('requestedTokens',   onGetTokens);
    connection.on('requestedEndpoints',onGetEndpoints);

    // ---- DEBUG: fetch token on any load ----
    function onRender() {
        // tell JB we’re ready to initialize
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // client-side OAuth just for debugging:
        $.ajax({
          url: 'https://login.mec1.pure.cloud/oauth/token',
          method: 'POST',
          contentType: 'application/x-www-form-urlencoded',
          data: {
            grant_type:    'client_credentials',
            client_id:     'a36298ab-fed3-428c-9d1f-86e99c982b63',
            client_secret: 'tJL4zU-PQpV6BHI-owOChKzE5v8M9U0WkDRfbWcU0wY'
          }
        })
        .done(function(resp) {
          console.log('🛠️ [DEBUG] Genesys OAuth Token:', resp.access_token);
        })
        .fail(function(err) {
          console.error('🛠️ [DEBUG] Genesys OAuth Error:', err);
        });
    }
  
    function initialize(data) {
      payload = data || {};

      console.log("testing 3");    
  
      // Read existing inArguments if any
      const inArgs = payload.arguments?.execute?.inArguments || [];
      $('#messagingService').val(inArgs.find(a => a.phoneNumber)?.phoneNumber || '');
      $('#messageBody').val(inArgs.find(a => a.body)?.body || '');
        
      console.log("testing 4");    
      // Enable the "Done" button
      connection.trigger('updateButton', {
        button: 'next',
        text: 'done',
        visible: true
      });
    }
  
    function save() {
      const phoneNumber = $('#messagingService').val();
      const bodyValue   = $('#messageBody').val();
  
      payload.arguments.execute.inArguments = [
        { phoneNumber },
        { body: bodyValue }
      ];
      payload.metaData.isConfigured = true;
  
      connection.trigger('updateActivity', payload);
    }
  });
  