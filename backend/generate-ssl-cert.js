const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Your network IP address
const YOUR_IP = '10.111.5.200';

// Check if we can use node-forge
try {
  const forge = require('node-forge');
  const pki = forge.pki;

  // Generate key pair
  const keys = pki.rsa.generateKeyPair(2048);

  // Create certificate
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    name: 'stateOrProvinceName',
    value: 'California'
  }, {
    name: 'localityName',
    value: 'San Francisco'
  }, {
    name: 'organizationName',
    value: 'Shoe Store Dev'
  }];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // Add Subject Alternative Names (SAN) for mobile device access
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }, {
      type: 2, // DNS
      value: 'your-machine-name'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }, {
      type: 7, // IP
      ip: YOUR_IP // Your network IP
    }]
  }]);

  cert.sign(keys.privateKey);

  // Convert to PEM format
  const pem = {
    privateKey: pki.privateKeyToPem(keys.privateKey),
    certificate: pki.certificateToPem(cert)
  };

  // Create certificates directory
  const certDir = path.join(__dirname, 'certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  // Write files
  fs.writeFileSync(path.join(certDir, 'key.pem'), pem.privateKey);
  fs.writeFileSync(path.join(certDir, 'cert.pem'), pem.certificate);

  console.log('✓ Certificates generated successfully!');
  console.log(`  - ${path.join(certDir, 'key.pem')}`);
  console.log(`  - ${path.join(certDir, 'cert.pem')}`);
  console.log(`\nCertificate includes SAN for: localhost, 127.0.0.1, ${YOUR_IP}`);
  console.log('\n⚠️  For mobile devices, you may need to trust this certificate:');
  console.log(`   1. Copy cert.pem to your phone`);
  console.log(`   2. Install and trust the certificate in device settings`);

} catch (err) {
  console.error('Error generating certificates:', err.message);
  console.error('\nPlease install node-forge: npm install node-forge');
  process.exit(1);
}
