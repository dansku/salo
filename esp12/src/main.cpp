/*
  Salo Lamp Project
*/

#include <FS.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <ThingerWebConfig.h>

// Debug
#define _DEBUG_

// Auto Config
ThingerWebConfig thing;

// Pins
int leds[4] = {13,12,14,16}; // RED(D7) - GREEN(D6) - BLUE(D5) - WHITE(D0)
int reset = 0;

// Variables
int fadeSpeed = 15;                 //fading delay
// #define maxVal(a,b) ((a)>(b)?(a):(b));  // Replacement for max()
int oldC[4] = {0,0,0,0};                // Old colors
int color[4] = {0,0,0,0};               // Red Green Blue White


// Set New Color
void setColor(int* leds,int* color)
{
  for(int i = 0; i <= 3; i++)
  {
    Serial.print("Changing LED: ");
    Serial.print(leds[i]);
    Serial.print(" to ");
    Serial.println(color[i]);
    Serial.println("---");
  }
}

void fadeToColor(int* led, int* startColor, int* endColor, int fadeSpeed){
 int changeRed   = endColor[0] - startColor[0];                                  //the difference in the two colors for the red channel
 int changeGreen = endColor[1] - startColor[1];                                  //the difference in the two colors for the green channel
 int changeBlue  = endColor[2] - startColor[2];
 int changeWhite = endColor[3] - startColor[3];                                  //the difference in the two colors for the blue channel
 int steps = max(abs(changeRed),max(abs(changeGreen), abs(changeBlue)));         //make the number of change steps the maximum channel change

 for(int i = 0 ; i < steps; i++){                                                //iterate for the channel with the maximum change
   int newRed      = startColor[0] + (i * changeRed / steps);                   //the newRed intensity dependant on the start intensity and the change determined above
   int newGreen    = startColor[1] + (i * changeGreen / steps);                 //the newGreen intensity
   int newBlue     = startColor[2] + (i * changeBlue / steps);
   int newWhite    = startColor[3] + (i * changeWhite / steps);                  //the newBlue intensity
   int newColor[]  = {newRed, newGreen, newBlue, newWhite};                     //Define an RGB color array for the new color
   setColor(leds, newColor);
   delay(fadeSpeed);                                                             //Set the LED to the calculated value
 }
}


void setup()
{
  // Serial YO!
  Serial.begin(115200);
  Serial.println("Sale lamp starting...");

  //Reset option
  if(reset==1)
  {
    Serial.println("RESET ON!");
    WiFiManager wifiManager;
    wifiManager.resetSettings();
  }

  // Everytime a websocket msg is received
  thing["colors"] << [](pson& in){

    // Update old color array
    for(int i=0;i<=3;i++)
    {
      oldC[i] = color[i];
    }

    color[0] = in["red"];
    color[1] = in["green"];
    color[2] = in["blue"];
    color[3] = in["white"];

    fadeToColor(leds, color, oldC, fadeSpeed);

  };
}

void loop()
{
  thing.handle();
}
