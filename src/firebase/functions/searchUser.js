async function buscarUsuarioLogado(uid) {
  if (!uid) {
      throw new Error('UID inválido.');
  }

  try {
      // Obter informações básicas do usuário
      const userRecord = await authAdmin.getUser(uid);
      const email = userRecord.email;

      // Buscar informações do perfil na coleção Users -> profiles -> user-UID
      const userProfileDoc = await firestoreAdmin.collection('Users').doc('profiles').collection(`user-${uid}`).doc('profile').get();

      if (!userProfileDoc.exists) {
          throw new Error('Usuário não encontrado na coleção Users/profiles/user-UID');
      }

      const userProfileData = userProfileDoc.data();
      const { nome, sobrenome, telefone, genero, foto } = userProfileData;

      // Verificar se todos os campos obrigatórios estão presentes
      if (!nome || !sobrenome || !telefone || !genero || !foto) {
          throw new Error('Dados do perfil do usuário estão incompletos.');
      }

      return {
          uid,
          email,
          nome,
          sobrenome,
          telefone,
          genero,
          foto
      };
  } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      throw error;
  }
}