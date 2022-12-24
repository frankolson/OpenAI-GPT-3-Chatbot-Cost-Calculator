import $ from "./jquery.js";
import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';

$(document).ready(function() {
  updateResponseSize();
  updateCostCalculations();
  updateGeneratedResponses();

  $('#calculatorForm').change(function() {
    updateResponseSize();
    updateCostCalculations();
    updateGeneratedResponses();
  });

  function updateResponseSize() {
    var responseSize = calculateResponseSize();
    var responseWordsSize = calculateWordsFromTokens(responseSize);
    var responseSizeInWords = `${responseSize} tokens (≈${responseWordsSize} words)`;

    $('#responseSize').text(responseSizeInWords);
  }

  function calculateResponseSize() {
    var promptSize = parseInt($('input[name="promptSize"]').val());
    var inputSize = parseInt($('input[name="inputSize"]').val());
    var maxToken = parseInt($('input[name="maxToken"]').val());

    return maxToken - (promptSize + inputSize);
  }

  function updateCostCalculations() {
    var interactionsPerDay = calculateInteractionsPerDay();
    $('#calculatedInteractionsCount').text(interactionsPerDay);

    var costPerInteraction = calculateCostPerInteraction();
    if (costPerInteraction == null) {
      $('#calculatedInteractionsCost').text("N/A");
    } else {
      var costPerInteractionInWords = `${costPerInteraction}`;
      $('#calculatedInteractionsCost').text(`$${costPerInteraction}`);
    }

    var interactionsPerMonth = interactionsPerDay * 31;
    $('#monthlyInteractions').text(interactionsPerMonth);

    var calculatedMonthlyCost = interactionsPerMonth * costPerInteraction;
    $('#calculatedMonthlyCost').text(`$${calculatedMonthlyCost.toFixed(2)}`);
  }

  function calculateInteractionsPerDay() {
    var interactionSize = parseInt($('input[name="interactionSize"]').val());
    var conversationSize = parseInt($('input[name="conversationSize"]').val());
    return interactionSize * conversationSize;
  }

  function calculateCostPerInteraction() {
    var maxToken = parseInt($('input[name="maxToken"]').val());
    var languageModel = $('select[name="languageModel"]').val();

    // switch case based on languageModel where the values are davinci, currie, babbage, and ada
    switch (languageModel) {
      case 'davinci':
        // limit the answer to 2 decimal points
        return (maxToken/1000) * 0.02;
      case 'currie':
        return (maxToken/1000) * 0.002;
      case 'babbage':
        return (maxToken/1000) * 0.0005;
      case 'ada':
        return (maxToken/1000) * 0.0004;
      default:
        return null;
    }
  }

  function updateGeneratedResponses() {
    var conversationExample = $('#conversationExample');
    var conversationPromptExample = $('#conversationPromptExample');
    var [generatedConversation, generatedSubmissions] = generateConversation();
    
    conversationExample.html(generatedConversation);
    conversationPromptExample.html(generatedSubmissions);
  }

  function generateConversation() {
    var inputSize = parseInt($('input[name="inputSize"]').val());
    var promptSize = parseInt($('input[name="promptSize"]').val());
    var responseSize = calculateResponseSize();
    var conversationSize = parseInt($('input[name="conversationSize"]').val());

    // create an array of generated conversations
    var generatedConversations = [];
    var generatedSubmissions = [];
    for (var i = 0; i < conversationSize; i++) {
      var example = generateInteraction(inputSize, promptSize, responseSize);
      // create an html element for the generated conversation
      var generatedConversation = $(`<div><p><b>You:</b><br />${example.input}</p><p><b>Chatbot:</b><br />${example.response}</p></div>`)
      var generatedSubmission = $(`<div><p><b>You:</b><br /><span style="color: red;">${example.prompt}: </span>${example.input}</p><p><b>Chatbot:</b><br />${example.response}</p></div>`)
      
      generatedConversations.push(generatedConversation);
      generatedSubmissions.push(generatedSubmission);
    }

    return [generatedConversations, generatedSubmissions];
  }

  function generateInteraction(inputSize, promptSize, responseSize) {
    return {
      input: faker.lorem.words(calculateWordsFromTokens(inputSize)),
      prompt: faker.lorem.words(calculateWordsFromTokens(promptSize)),
      response: faker.lorem.words(calculateWordsFromTokens(responseSize))
    };
  }

  function calculateWordsFromTokens(tokens) {
    return Math.floor(tokens * 0.75);
  }
});
