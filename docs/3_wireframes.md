# 4/ Maquettes

Les interfaces sont conçues pour être simples, avec des boutons larges et un langage clair.

## 1. Commerçant : Création de Mission (React Native)
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const CreateMission = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvelle Livraison</Text>
      <TextInput placeholder="Type de marchandise (ex: Sac de riz)" style={styles.input} />
      <TextInput placeholder="Lieu de ramassage" style={styles.input} />
      <TextInput placeholder="Destination" style={styles.input} />
      <TextInput placeholder="Prix proposé (CFA)" keyboardType="numeric" style={styles.input} />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>PUBLIER LA DEMANDE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 20, padding: 10 },
  button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
```

## 2. Livreur : Dashboard / Liste des Missions (React Native)
```javascript
const DriverDashboard = ({ missions }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Missions à proximité</Text>
    <FlatList
      data={missions}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cargo}>{item.cargo_type}</Text>
          <Text>{item.pickup_address} -> {item.delivery_address}</Text>
          <Text style={styles.price}>{item.price} XAF</Text>
          <Button title="ACCEPTER LA MISSION" color="#2980b9" onPress={() => handleAccept(item.id)} />
        </View>
      )}
    />
  </View>
);
```

## 3. Administrateur : Suivi des Transactions (React Web)
```javascript
const AdminDashboard = () => {
  return (
    <div className="admin-panel">
      <h1>Tableau de bord Admin</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Marchand</th>
            <th>Livreur</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Mapping des missions */}
          <tr>
            <td>#102</td>
            <td>Mamadou S.</td>
            <td>Jean K.</td>
            <td><span className="badge-warning">Litige en cours</span></td>
            <td><button>Voir les preuves photo</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
```
