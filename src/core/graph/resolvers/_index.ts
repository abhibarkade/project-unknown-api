import {Resolvers} from '../../../generated/graphql'
import {authResolver} from './auth.resolver'
import {mergeResolvers} from '@graphql-tools/merge'
import {userResolver} from './user.resolver'

export const resolvers: Resolvers = mergeResolvers([authResolver, userResolver])
