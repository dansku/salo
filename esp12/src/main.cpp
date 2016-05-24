/*
  Salo Lamp Project
  2016
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
uint8_t leds[4] = {13,12,14,16};                                                  // RED(D7) - GREEN(D6) - BLUE(D5) - WHITE(D0)
uint8_t reset   = 0;                                                              // Should we reset Wifi and Module settings

// Variables
uint8_t fadeSpeed = 15;                                                           //fading delay
uint8_t oldC[4], color[5];

// Set New Color
void setColor(uint8_t* leds, uint8_t* color)
{
  for(int i = 0; i <= 3; i++)
  {
    printf("Changing LED %d to %d \n", leds[i], color[i]);
  }
}

void fadeToColor(uint8_t* leds, uint8_t* startColor, uint8_t* endColor, int fadeSpeed)
{
  int changeRed   = endColor[0] - startColor[0];                                  //the difference in the two colors for the red channel
  int changeGreen = endColor[1] - startColor[1];                                  //the difference in the two colors for the green channel
  int changeBlue  = endColor[2] - startColor[2];                                  //the difference in the two colors for the blue channel
  int changeWhite = endColor[3] - startColor[3];
  int steps = max(abs(changeRed),max(abs(changeGreen), abs(changeBlue)));         //make the number of change steps the maximum channel change

  for(int i = 0 ; i < steps; i++){                                                //iterate for the channel with the maximum change
    uint8_t newRed      = startColor[0] + (i * changeRed / steps);                //the newRed intensity dependant on the start intensity and the change determined above
    uint8_t newGreen    = startColor[1] + (i * changeGreen / steps);              //the newGreen intensity
    uint8_t newBlue     = startColor[2] + (i * changeBlue / steps);
    uint8_t newWhite    = startColor[3] + (i * changeWhite / steps);              //the newBlue intensity
    uint8_t newColor[]  = {newRed, newGreen, newBlue, newWhite};                  //Define an RGB color array for the new color
    setColor(leds, newColor);
    delay(fadeSpeed);                                                             //Set the LED to the calculated value
  }
}

// Function to Convert HSL to RGB, return an array
uint8_t HSLtoRGB(uint16_t H, double_t S, double_t L)
{
  // 0 <= H <= 360 in degrees
  // 0.00 <= S <= 1
  // 0.00 <= L <= 1
  uint8_t rgb[3];

  // First Case
  if(S == 0)
  {
    for(int i = 0; i < 3; i++)
    {
      rgb[i] = ceil(L * 255);
    }
    return *rgb;
  }
}

void setup()
{

  // Serial YO!
  Serial.begin(115200);
  printf("Lamp starting \n");

  //Reset option
  if(reset==1)
  {
    printf("RESET ON \n");
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
    color[4] = in["fade"];
    color[5] = in["fadeSpeed"];

    color[4] == 1 ? fadeToColor(leds, oldC, color, fadeSpeed) : setColor(leds, color);  // Select if we want fade or not

    if(color[4] == 1)
    {
      uint8_t r[3] = {0,0,0};
    }
  };
}

void loop()
{
  thing.handle();
}
