/*
  Salo Lamp Project
*/

#include <FS.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <ThingerWebConfig.h>

// Auto Config
ThingerWebConfig thing;

// Debug
#define _DEBUG_

// Pins
const int leds[4] = {14,12,13,1}; // RED GREEN BLUE WHITE
const int RESET = 0;

// Variables
const int mydelay = 15;
#define maxVal(a,b) ((a)>(b)?(a):(b));  // Replacement for max()
int newC[4] = {0,0,0,0};                // red green blue white
int oldC[4] = {0,0,0,0};                // old colors

// void setColor(int* led, int* color)
// {
//   for(int i=0;i<=3;i++){
//     Serial.print("LED: ");
//     Serial.print(i);
//     Serial.print(" to ");
//     Serial.println(color[i]);
//     //    analogWrite(led[i], color[i]);
//   }
// }


void setup()
{

  // Serial YO!
  Serial.begin(115200);

  //Led as output
  for(int i=0;i<=3;i++)
  {
    pinMode(leds[i],OUTPUT);
    }

  // pinMode(RESET,INPUT);  // Reset switch

  // Check for reset button
  if(RESET==1)
  {
    WiFiManager wifiManager;
    wifiManager.resetSettings();
    Serial.println("RESET ON!");
  }

  thing["colors"] << [](pson& in)
  {

    // Set Old Color
    for(int i=0;i<=3;i++)
    {
      oldC[i] = newC[i];
    }

    // Get values from WebSocket
    newC[1] = in["red"];
    newC[2] = in["green"];
    newC[0] = in["blue"];
    newC[3] = in["white"];


//    // Print values
//    Serial.print(millis());
//    Serial.print(" - Red: ");
//    Serial.print(newC[0]);
//    Serial.print(" - Green: ");
//    Serial.print(newC[1]);
//    Serial.print(" - Blue: ");
//    Serial.print(newC[2]);
//    Serial.print(" - White: ");
//    Serial.println(newC[3]);
//
//    fadeToColor(leds,oldC,newC,mydelay );
      // setColor(leds,newC);

  };

}

void loop()
{
  // Thinger
  thing.handle();
}




//void setColor(int* led, byte* color){
//  for(int i = 0; i < 3; i++){
//    // analogWrite(led[i], color[i]);
//    Serial.print("LED ");
//    Serial.print(led[i]);
//    Serial.print(" with color ");
//    Serial.print(color[i]);
//  }
//}
//
//void setColor(int* led, const byte* color){
//  byte tempByte[] = {color[0], color[1], color[2]};
//  setColor(newC, tempByte);
//}


//void fadeToColor(int* led, byte* startColor, byte* endColor, int fadeSpeed){
//  int changeRed   = endColor[0] - startColor[0];                                  //the difference in the two colors for the red channel
//  int changeGreen = endColor[1] - startColor[1];                                  //the difference in the two colors for the green channel
//  int changeBlue  = endColor[2] - startColor[2];                                  //the difference in the two colors for the blue channel
//  int steps = maxVal(abs(changeRed),maxVal(abs(changeGreen), abs(changeBlue)));   //make the number of change steps the maximum channel change
//
//  for(int i = 0 ; i < steps; i++){                                                //iterate for the channel with the maximum change
//    byte newRed = startColor[0] + (i * changeRed / steps);                        //the newRed intensity dependant on the start intensity and the change determined above
//    byte newGreen = startColor[1] + (i * changeGreen / steps);                    //the newGreen intensity
//    byte newBlue = startColor[2] + (i * changeBlue / steps);                      //the newBlue intensity
//    byte newColor[] = {newRed, newGreen, newBlue};                                //Define an RGB color array for the new color
//    setColor(newC, newColor);                                                      //Set the LED to the calculated value
//  }
//  setColor(newC, endColor);                                                        //The LED should be at the endColor but set to endColor to avoid rounding errors
//}
//
