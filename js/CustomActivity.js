define(['postmonger'], function(Postmonger) {
    'use strict';
  
    const connection = new Postmonger.Session();
    let payload = {};
    console.log("testing 1");    
    $(window).ready(() => {
      connection.trigger('ready');
      connection.trigger('requestTokens');
      connection.trigger('requestEndpoints');
    });

    console.log("testing 2");    
  
    connection.on('initActivity', initialize);
    connection.on('clickedNext',   save);
  
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
  