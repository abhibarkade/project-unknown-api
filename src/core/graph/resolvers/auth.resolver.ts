import {ResolverContext} from '../../../@types/context'

import {Resolvers, SignInResponse, UserResponse} from '../../../generated/graphql'
import {signIn, signup} from '../services/user.service'

export const authResolver: Resolvers = {
    Mutation: {
        signUp: (_, {input}, context: ResolverContext): Promise<UserResponse> => {
            return signup(context, input)
        },
        signIn: (_, {input}, context: ResolverContext): Promise<SignInResponse> => {
            return signIn(context, input)
        }
    }
}
