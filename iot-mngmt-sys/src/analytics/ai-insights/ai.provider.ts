import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Analytics } from '../entities/analytics.entity';
import { Tool } from 'openai/resources/responses/responses.js';

@Injectable()
export class AiProvider {
  private client: OpenAI;

  private tool: Tool;

  private PROMPT = `
  You are the IoT Energy Management Intelligence Agent. Your role is to monitor IoT telemetry data for the Multi-Tenant Energy Management System.
  
  EVALUATION CRITERIA:
  1. TEMPERATURE: If Max Temperature > 75°C, issue a 'high' severity 'overheating' warning. If > 90°C, make it 'critical'.
  2. POWER: If avgPower is 20% higher than typical for the appliance type, flag a 'power_surge'.
  3. SECURITY: Look for 'unusual_activity' such as the appliance drawing power during scheduled 'Off' hours in the telemetry log.
  
  OUTPUT: You MUST call the 'analyze_energy_telemetry' tool to return your findings. Do not provide a text response outside of the tool call. The tool call output array most have a length of 1.
`;
  constructor() {
    // Initialization for OpenAI provider
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.tool = {
      type: `function`,
      name: `analyze_energy_telemetry`,
      description: `Analyzes appliance telemetry data to provide security/efficiency insights and warnings.`,
      parameters: {
        type: `object`,
        properties: {
          warnings: {
            type: `array`,
            description: `Warnings about the current state of the appliance.`,
            items: {
              type: `object`,
              properties: {
                type: {
                  type: `string`,
                  enum: [
                    `overheating`,
                    `power_surge`,
                    `unusual_activity`,
                    `efficiency_drop`,
                  ],
                },
                severity: {
                  type: `string`,
                  enum: [`low`, `medium`, `high`, `critical`],
                },
                message: { type: `string` },
              },
              required: [`type`, `severity`, `message`],
              additionalProperties: false,
            },
          },
          insights: {
            type: `array`,
            items: { type: `string` },
            description: `Technical observations about the current state of the appliance.`,
          },
          recommendations: {
            type: `array`,
            items: { type: `string` },
            description: `Actionable steps to improve safety or reduce costs.`,
          },
        },
        required: [`warnings`, `insights`, `recommendations`],
        additionalProperties: false,
      },
      strict: false,
    };
  }
  async generateResponse(data: {
    appliance: string;
    telemetry: Analytics[];
    avgPower: number;
    maxTemp: number;
  }) {
    try {
      const response = await this.client.responses.create({
        model: 'gpt-4o-mini',
        instructions: '',
        tools: [this.tool],
        tool_choice: 'auto',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `
                  Appliance: ${data.appliance}
                  Average Power: ${data.avgPower}
                  Max Temperature: ${data.maxTemp}
                  Telemetry Log: ${JSON.stringify(data.telemetry)}
                `.trim(),
              },
            ],
          },
        ], //fix this
      });
      // console.log(response.output_text);
      // console.log('OpenAI response:', response.output || response.output_text);
      // const normalize = normalizeToolCalls(response.output_text);
      // if(normalize.length > 0 ){
      //   return normalize;
      // }
      return response.output_text
        ? response.output_text
        : response.output.map((call: any) => {
            return {
              name: call.name,
              args: JSON.parse(call.arguments) as {
                warnings: { type: string; severity: string; message: string }[];
                insights: string[];
                recommendations: string[];
              },
            };
          });
    } catch (error) {
      console.error(error);
      return 'Could not process your request';
    }
  }
}
