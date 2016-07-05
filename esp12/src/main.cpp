// /*
//   Salo Lamp Project
//   2016
// */
//
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
/*
  13 = white
  12 = green
  14 = blue
  15 = red

green ok
blue  ok
red   no
white no

*/
uint8_t leds[4] = {13,15,12,14};                                                  // RED(D7) - GREEN(D6) - BLUE(D5) - WHITE(D0)
uint8_t reset   = 0;                                                              // Should we reset Wifi and Module settings

// Variables
uint8_t fadeSpeed = 15;                                                           //fading delay
uint16_t oldC[4], color[5];

// Set New Color
void setColor(uint8_t* leds, uint16_t* color)
{
  for(int i = 0; i <= 3; i++)
  {
    printf("Changing LED %d to %d \n", leds[i], color[i]);
    analogWrite(leds[i], color[i]);
  }
}

void fadeToColor(uint8_t* leds, uint16_t* startColor, uint16_t* endColor, int fadeSpeed)
{
  int changeRed   = endColor[0] - startColor[0];                                  //the difference in the two colors for the red channel
  int changeGreen = endColor[1] - startColor[1];                                  //the difference in the two colors for the green channel
  int changeBlue  = endColor[2] - startColor[2];                                  //the difference in the two colors for the blue channel
  int changeWhite = endColor[3] - startColor[3];
  int steps = max(abs(changeRed),max(abs(changeGreen), abs(changeBlue)));         //make the number of change steps the maximum channel change

  for(int i = 0 ; i < steps; i++){                                                //iterate for the channel with the maximum change
    uint16_t newRed      = startColor[0] + (i * changeRed / steps);                //the newRed intensity dependant on the start intensity and the change determined above
    uint16_t newGreen    = startColor[1] + (i * changeGreen / steps);              //the newGreen intensity
    uint16_t newBlue     = startColor[2] + (i * changeBlue / steps);
    uint16_t newWhite    = startColor[3] + (i * changeWhite / steps);              //the newBlue intensity
    uint16_t newColor[]  = {newRed, newGreen, newBlue, newWhite};                  //Define an RGB color array for the new color
    setColor(leds, newColor);
    delay(fadeSpeed);                                                             //Set the LED to the calculated value
  }
}

void setup()
{

  // Serial YO!
  Serial.begin(115200);
  printf("Lamp starting \n");
  pinMode(13, INPUT);

  //Reset option
  if(13==HIGH)
  {
    printf("RESET ON \n");
    WiFiManager wifiManager;
    wifiManager.resetSettings();
  }
  else
  {
    printf("RESET OFF \n");
  }

  // Everytime a websocket msg is received
  thing["colors"] << [](pson& in){

    // Update old color array
    for(int i=0;i<=3;i++)
    {
      oldC[i] = color[i];
    }

    color[0] = in["white"];
    color[1] = in["red"];
    color[2] = in["green"];
    color[3] = in["blue"];
    color[4] = in["fade"];
    color[5] = in["fadeSpeed"];

    color[4] == 1 ? fadeToColor(leds, oldC, color, fadeSpeed) : setColor(leds, color);  // Select if we want fade or not

  };
}

void loop()
{
  thing.handle();
}
