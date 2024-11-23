import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    id:'',
    username : '',
    email : '',
    profilePic : null
}

const userSlice = createSlice({
    name : "user",
    initialState,
    reducers : {
        login : function(state,action){
            const {id,username,email,profilePic} = action.payload;
            state.id = id,
            state.username = username,
            state.email = email,
            state.profilePic = profilePic
        },
        logout : function(state){
            state.id = '',
            state.username = '',
            state.email = '',
            state.profilePic = null
        },
        updateUser: (state, action) => {
            const { username, email, profilePic } = action.payload;
            if (username) state.username = username;
            if (email) state.email = email;
            if (profilePic) state.profilePic = profilePic;
        },
    }
});

export const {login,logout,updateUser} = userSlice.actions;
export default userSlice.reducer;