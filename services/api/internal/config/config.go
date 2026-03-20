package config

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

var (
	Conf *Config
)

type Config struct {
	DBHost     string `yaml:"DBHost"`
	DBUser     string `yaml:"DBUser"`
	DBName     string `yaml:"DBName"`
	DBPassword string `yaml:"DBPassword"`
}

func InitConfig() {
	configPath, ok := os.LookupEnv("CONFIG_PATH")
	if !ok {
		configPath = "conf.yml"
	}

	yamlFile, err := os.ReadFile(configPath)
	if err != nil {
		log.Panic(err.Error())
	}

	err = yaml.Unmarshal(yamlFile, &Conf)
	if err != nil {
		log.Panic(err.Error())
	}
}
