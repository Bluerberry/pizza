
import pino from 'pino';

const inDevelopment = process.env.NODE_ENV !== 'production';
const log = pino(
	inDevelopment ? {
		level: 'debug',
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				singleLine: true,
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname'
			}
		}
	} : {
		level: 'info',
		timestamp: pino.stdTimeFunctions.isoTime
	}
)

export default log;