export const IPC = {
  GET_RULES: 'rules:get',
  SET_RULES: 'rules:set',
  GET_SETTINGS: 'settings:get',
  SET_SETTINGS: 'settings:set',
  OPEN_SETTINGS: 'window:openSettings',
  TEST_RULE: 'rules:test',
  SHOW_MESSAGE: 'pet:showMessage',
  DISMISS_MESSAGE: 'pet:dismiss',
  SNOOZE_MESSAGE: 'pet:snooze',
  GET_PETS: 'pets:get',
  ADD_PET: 'pets:add',
  RENAME_PET: 'pets:rename',
  DELETE_PET: 'pets:delete',
  PICK_IMAGE: 'pets:pickImage',
  ADD_POSE: 'pets:addPose',
  DELETE_POSE: 'pets:deletePose'
} as const
