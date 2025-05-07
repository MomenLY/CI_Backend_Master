const adminModules = {
  users: {
    label: 'User',
    moduleKey: 'users',
    accessRules: {
      viewUsers: {
        label: 'View Users',
        defaultPermission: true,
      },
      editUser: {
        label: 'Edit User',
      },
      addUser: {
        label: 'Add User',
      },
      deleteUser: {
        label: 'Delete User',
      },
      bulkUpload: {
        label: 'Bulk Upload',
        connectedFeature: 'bulkUpload',
        defaultPermission: true,
      },
      permissions: {
        label: 'Permissions',
      },
    },
  },
  settings: {
    label: 'Settings',
    moduleKey: 'settings',
    accessRules: {
      viewSettings: {
        label: 'View Settings',
        defaultPermission: true,
      },
      editSettings: {
        label: 'Edit Settings',
        defaultPermission: true,
      },
      addSettings: {
        label: 'Add Settings',
        defaultPermission: false,
      },
      deleteSettings: {
        label: 'Delete Settings',
        defaultPermission: true,
      },
    },
  },
  role: {
    label: 'Role',
    moduleKey: 'role',
    accessRules: {
      viewRoles: {
        label: 'View Roles',
      },
      editRole: {
        label: 'Edit Role',
      },
      addRole: {
        label: 'Add Role',
      },
      deleteRole: {
        label: 'Delete Role',
      },
      assignUser: {
        label: 'Assign Users',
      },
    },
  },
  profileField: {
    label: 'Profile Field',
    moduleKey: 'profileField',
    accessRules: {
      viewProfileField: {
        label: 'View Profile Field',
      },
      editProfileField: {
        label: 'Edit Profile Field',
      },
      addProfileField: {
        label: 'Add Profile Field',
      },
      deleteProfileField: {
        label: 'Delete Profile Field',
      },
    },
  },
  label: {
    label: 'Label',
    moduleKey: 'label',
    accessRules: {
      viewLabel: {
        label: 'View Labels',
        defaultPermission: true,
      },
      editLabel: {
        label: 'Edit Label',
        defaultPermission: true,
      },
      addLabel: {
        label: 'Add Label',
        defaultPermission: true,
      },
      deleteLabel: {
        label: 'Delete Label',
        defaultPermission: true,
      },
    },
  },
};

export default adminModules;
