console.log('🔌 customActivity.js loaded');

define(['postmonger'], function(Postmonger) {
    'use strict';
  
    const connection = new Postmonger.Session();
    let payload = {};
    const steps      = [
        { label: "Configure Message", key: "messageBody" }
    ];
    console.log("testing 1");    

    // Journey Builder events
    connection.on('initActivity',      initialize);
    connection.on('clickedNext',       save);
    connection.on('requestedTokens',   onGetTokens);
    connection.on('requestedEndpoints',onGetEndpoints);

    console.log("Execution flow 2");  

     // When the page loads…
     $(window).ready(() => {
      console.log('CustomActivity.js loaded');
      connection.trigger('ready');
      connection.trigger('requestTokens');
      connection.trigger('requestEndpoints');
    });
    
    function initialize(data) {
      payload = data || {};
      
      // 1) grab whatever inArguments were saved previously
      const inArgs = payload.arguments?.execute?.inArguments || [];
      console.log("testing 3"); 
  
      // 2) extract each field by the exact key you wrote to in save()
      const responseId = inArgs.find(a => a.responseId)?.responseId || '';
      const phone     = inArgs.find(a => a.phone)?.phone || '';
      const sessionId = inArgs.find(a => a.sessionId)?.sessionId || '';
      const contactId = inArgs.find(a => a.contactId)?.contactId || '';
  
      // 3) populate your UI
      $('#responseId').val(responseId);
      $('#phone').val(phone);
      $('#sessionId').val(sessionId);
      $('#contactId').val(contactId);
        
      console.log("testing 4");
      
      // Enable the "Done" button
      connection.trigger('updateButton', {
        button: 'next',
        text: 'done',
        visible: true
      });
    } 

    function onGetTokens(tokens) {
      console.log('SFMC tokens:', tokens);
      // you could stash tokens.token / tokens.fuel2token if you ever need to call SFMC REST
    }
  
    function onGetEndpoints(endpoints) {
      console.log('SFMC endpoints:', endpoints);
    }
  
    function save() {
      console.log("testing 4");  

      // read back from the UI
      const responseId = $('#responseId').val();
      console.log("testing 5"+responseId);    

      const phone      = $('#phone').val();
      console.log("testing 6"+phone);
      
      const sessionId  = $('#sessionId').val();
      console.log("testing 7"+sessionId); 
      
      const contactId  = $('#contactId').val();
      console.log("testing 8"+contactId);    
  
      payload.arguments.execute.inArguments = [
        { responseId },
        { phone },
        { sessionId },
        { contactId }
      ];
      payload.metaData.isConfigured = true;
      console.log('updated payload, firing updateActivity', payload);
      connection.trigger('updateActivity', payload);
    }

  });
  
