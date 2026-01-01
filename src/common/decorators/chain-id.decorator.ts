import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const ChainId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // Supporting 'chain-id' or 'x-chain-id'
        const headerValue = request.headers['chain-id'] || request.headers['x-chain-id'];

        if (!headerValue) {
            throw new BadRequestException('Chain ID header (chain-id or x-chain-id) is required');
        }

        // Format expected: eip155:123 or just 123
        // If it contains ':', split and take the second part
        let chainIdStr = headerValue;
        if (headerValue.includes(':')) {
            const parts = headerValue.split(':');
            if (parts.length !== 2) {
                throw new BadRequestException('Invalid Chain ID format. Expected eip155:123');
            }
            chainIdStr = parts[1];
        }

        const chainId = parseInt(chainIdStr, 10);
        if (isNaN(chainId)) {
            throw new BadRequestException('Invalid Chain ID. Must be a number.');
        }

        return chainId;
    },
);
