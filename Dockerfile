FROM --platform=linux/amd64 node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV development

COPY . .

RUN yarn install --frozen-lockfile
RUN yarn prisma generate
EXPOSE 3000

ENV PORT 3000

CMD ["yarn", "dev"]