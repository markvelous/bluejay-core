/* eslint-disable @typescript-eslint/camelcase */
import { APIGatewayEvent } from "aws-lambda";
import { publicRequestHandler } from "../../middlewares/handlers";
import { config } from "../../config";
import { getLogger } from "../../common/logger";

const { info } = getLogger("create claim");

const handleDebug = async (event: APIGatewayEvent) => {
  info(JSON.stringify(event));
  info(JSON.stringify(config));
  return { status: "OK" };
};

export const handler = publicRequestHandler(handleDebug);
