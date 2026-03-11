import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/features/docs/code-block";

const arduinoSketch = `#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

const char* MQTT_HOST = "YOUR_MQTT_HOST";
const int MQTT_PORT = 1883;

const char* DEVICE_ID = "device_id_here";
const char* DEVICE_TOKEN = "secure_token_here";
const char* APPLIANCE_LABEL = "fridge";

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

const char* ROOT_CA = "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----\\n";

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String body;
  for (unsigned int i = 0; i < length; i++) {
    body += (char)payload[i];
  }
  Serial.printf("Control message [%s]: %s\\n", topic, body.c_str());
  // TODO: Parse JSON and actuate appliance (ON/OFF).
}

void connectMqtt() {
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(onMqttMessage);

  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT...");
    if (mqttClient.connect(DEVICE_ID, DEVICE_ID, DEVICE_TOKEN)) {
      Serial.println("connected");
      mqttClient.subscribe("cmnd/device_id/+/state");
    } else {
      Serial.print("failed, rc=");
      Serial.println(mqttClient.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  secureClient.setCACert(ROOT_CA);
  connectMqtt();
}

void loop() {
  if (!mqttClient.connected()) {
    connectMqtt();
  }
  mqttClient.loop();

  const String topic = String("energy/") + DEVICE_ID + "/" + APPLIANCE_LABEL + "/telemetry";
  const String payload = String("{\\"power\\":120.5,\\"voltage\\":228.0,\\"temperature\\":36.2,\\"current\\":0.53}");
  mqttClient.publish(topic.c_str(), payload.c_str(), false);
  delay(5000);
}`;

export default function ArduinoDocsPage() {
  return (
    <section className="space-y-4">
      <Card title="Arduino MQTT Example" description="ESP32-compatible sketch">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          This example demonstrates TLS configuration, MQTT authentication,
          telemetry publishing, and command subscription.
        </p>
        <CodeBlock
          title="Telemetry + Command Handling"
          language="cpp"
          code={arduinoSketch}
          className="mt-4"
        />
      </Card>
    </section>
  );
}
